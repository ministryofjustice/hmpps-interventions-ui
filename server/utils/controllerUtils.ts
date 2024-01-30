import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import LayoutPresenter from '../routes/shared/layoutPresenter'
import LayoutView, { PageContentView } from '../routes/shared/layoutView'
import DeliusServiceUser from '../models/delius/deliusServiceUser'
import DraftsService, { Draft } from '../services/draftsService'
import DraftNotFoundView from '../routes/shared/draftNotFoundView'
import DraftSoftDeletedView from '../routes/shared/draftSoftDeletedView'
import UserDataService from '../services/userDataService'
import ReferenceDataService from '../services/referenceDataService'
import WhatsNewCookieService from '../services/whatsNewCookieService'
import log from '../../log'

export interface DraftFetchSuccessResult<T> {
  rendered: false
  draft: Draft<T>
}

interface DraftFetchRenderedResult {
  rendered: true
}

export type DraftFetchResult<T> = DraftFetchSuccessResult<T> | DraftFetchRenderedResult

type BackLink = {
  target?: string
  message?: string
}

export default class ControllerUtils {
  static async renderWithLayout(
    req: Request,
    res: Response,
    contentView: PageContentView,
    serviceUser: DeliusServiceUser | null,
    userType: 'service-provider' | 'probation-practitioner' | null
  ): Promise<void> {
    let whatsNewBanner
    let showWhatsNewBanner = false
    const { userId } = res.locals.user || {}

    if (userType && userId) {
      whatsNewBanner = await ReferenceDataService.getWhatsNewBanner(userType, req.originalUrl)
      showWhatsNewBanner = whatsNewBanner?.version !== WhatsNewCookieService.getDismissedVersion(req, userId)

      if (whatsNewBanner?.version && req.query.dismissWhatsNewBanner) {
        WhatsNewCookieService.persistDismissedVersion(res, userId, whatsNewBanner.version)
        showWhatsNewBanner = false
      }
    }

    if (contentView.renderArgs[1].hideWhatsNewBanner) {
      showWhatsNewBanner = false
    }

    const presenter = new LayoutPresenter(
      req.originalUrl,
      res.locals.user,
      serviceUser,
      whatsNewBanner,
      showWhatsNewBanner
    )
    const view = new LayoutView(presenter, contentView)

    res.render(...view.renderArgs)
  }

  static async fetchDraftOrRenderMessage<T>(
    req: Request,
    res: Response,
    draftsService: DraftsService,
    userType: 'service-provider' | 'probation-practitioner' | null,
    {
      idParamName,
      notFoundUserMessage,
      backLink,
    }: {
      idParamName: string
      notFoundUserMessage?: string
      typeName: string
      backLink?: BackLink
    }
  ): Promise<DraftFetchResult<T>> {
    const id = req.params[idParamName]
    const draft = await draftsService.fetchDraft<T>(id, {
      userId: res.locals.user.userId,
    })

    if (draft === null) {
      res.status(StatusCodes.GONE)
      const view = new DraftNotFoundView(backLink, notFoundUserMessage)
      await this.renderWithLayout(req, res, view, null, userType)
      return { rendered: true }
    }

    if (draft.softDeleted) {
      res.status(StatusCodes.GONE)
      const message = notFoundUserMessage
      const view = new DraftSoftDeletedView(backLink, message)
      await this.renderWithLayout(req, res, view, null, userType)
      return { rendered: true }
    }

    return { rendered: false, draft }
  }

  static parseQueryParamAsPositiveInteger(req: Request, name: string): number | null {
    const param = Number(req.query[name])
    return Number.isNaN(param) || param < 1 ? null : param
  }

  static ariaSortToSortOrder(ariaSort: string): string | undefined {
    return { ascending: 'ASC', descending: 'DESC' }[ariaSort]
  }

  static sortOrderToAriaSort(sortOrder: string): string {
    return { ASC: 'ascending', DESC: 'descending' }[sortOrder] ?? 'none'
  }

  static async getSortOrderFromMojServerSideSortableTable(
    req: Request,
    res: Response,
    userDataService: UserDataService,
    storageDuration: number,
    tablePersistentId: string,
    validSortFields: string[],
    defaultPrimarySort: string,
    secondarySort: string | null = null
  ): Promise<string[]> {
    const { userId } = res.locals.user
    const userSortKey = `sortOrder:${tablePersistentId}`

    const { sort: sortQueryParam } = req.query

    let primarySort: string

    // if query params are passed, try to use them, and store the resulting sort.
    // otherwise, try to get the sort order from the user data service.
    // if the query params are invalid, or there is no stored sort order, fall back to the defaults.
    if (sortQueryParam !== undefined) {
      const [sortFieldQueryParam, sortOrderQueryParam] = (sortQueryParam as string).split(',')
      const sortOrder = this.ariaSortToSortOrder(sortOrderQueryParam)

      // only use the URL params if the sort field _and_ order are valid
      if (validSortFields.includes(sortFieldQueryParam) && sortOrder !== undefined) {
        primarySort = `${sortFieldQueryParam},${sortOrder}`
        await userDataService.store(userId, userSortKey, primarySort, storageDuration)
      } else {
        primarySort = defaultPrimarySort
      }
    } else {
      log.info('retrieving from the redis')
      const storedSort = await userDataService.retrieve(userId, `sortOrder:${tablePersistentId}`)
      log.info('stored Sort= ', storedSort)
      primarySort = storedSort ?? defaultPrimarySort
    }

    const sortList = [primarySort]

    if (secondarySort !== null) {
      const [secondarySortField] = secondarySort.split(',')
      if (!primarySort.startsWith(secondarySortField)) {
        sortList.push(secondarySort)
      }
    }

    log.info('sortedList= ', sortList)
    return Promise.resolve(sortList)
  }
}
