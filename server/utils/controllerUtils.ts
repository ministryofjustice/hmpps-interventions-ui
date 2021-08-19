import { Request, Response } from 'express'
import createError from 'http-errors'
import LayoutPresenter from '../routes/shared/layoutPresenter'
import LayoutView, { PageContentView } from '../routes/shared/layoutView'
import DeliusServiceUser from '../models/delius/deliusServiceUser'
import DraftsService, { Draft } from '../services/draftsService'
import DraftSoftDeletedView from '../routes/shared/draftSoftDeletedView'

interface DraftFetchSuccessResult<T> {
  rendered: false
  draft: Draft<T>
}

interface DraftFetchRenderedResult {
  rendered: true
}

type DraftFetchResult<T> = DraftFetchSuccessResult<T> | DraftFetchRenderedResult

export default class ControllerUtils {
  static renderWithLayout(res: Response, contentView: PageContentView, serviceUser: DeliusServiceUser | null): void {
    const presenter = new LayoutPresenter(res.locals.user, serviceUser)
    const view = new LayoutView(presenter, contentView)

    res.render(...view.renderArgs)
  }

  static async fetchDraftOrRenderMessage<T>(
    req: Request,
    res: Response,
    draftsService: DraftsService,
    {
      idParamName,
      notFoundUserMessage,
      typeName,
    }: { idParamName: string; notFoundUserMessage: string; typeName: string }
  ): Promise<DraftFetchResult<T>> {
    const id = req.params[idParamName]
    const draft = await draftsService.fetchDraft<T>(id, {
      userId: res.locals.user.userId,
    })

    if (draft === null) {
      throw createError(500, `Draft ${typeName} with ID ${id} not found by drafts service`, {
        userMessage: notFoundUserMessage,
      })
    }

    if (draft.softDeleted) {
      res.status(410 /* Gone */)
      const view = new DraftSoftDeletedView()
      this.renderWithLayout(res, view, null)
      return { rendered: true }
    }

    return { rendered: false, draft }
  }
}
