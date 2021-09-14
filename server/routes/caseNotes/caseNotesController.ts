import { Request, Response } from 'express'
import createError from 'http-errors'
import InterventionsService, { InterventionsServiceError } from '../../services/interventionsService'
import CaseNotesPresenter from './viewAll/caseNotesPresenter'
import CaseNotesView from './viewAll/caseNotesView'
import ControllerUtils from '../../utils/controllerUtils'
import CommunityApiService from '../../services/communityApiService'
import HmppsAuthService from '../../services/hmppsAuthService'
import AddCaseNotePresenter from './add/addCaseNotePresenter'
import AddCaseNoteView from './add/addCaseNoteView'
import AddNewCaseNoteForm from './add/AddNewCaseNoteForm'
import { FormValidationError } from '../../utils/formValidationError'
import createFormValidationErrorOrRethrow from '../../utils/interventionsFormError'
import DraftsService from '../../services/draftsService'
import CheckAddCaseNoteAnswersPresenter from './add/checkAnswers/addCaseNoteCheckAnswersPresenter'
import CheckAddCaseNoteAnswersView from './add/checkAnswers/addCaseNoteCheckAnswersView'
import { CaseNote } from '../../models/caseNote'
import CaseNotePresenter from './view/caseNotePresenter'
import CaseNoteView from './view/caseNoteView'

export type DraftCaseNote = null | CaseNote

export default class CaseNotesController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly draftsService: DraftsService
  ) {}

  async showCaseNotes(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const paginationQuery = {
      page: Number(req.query.page),
      size: 5,
    }
    const referralId = req.params.id
    const [referral, caseNotesPage] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getCaseNotes(accessToken, referralId, paginationQuery),
    ])
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const uniqueUsers = new Set(caseNotesPage.content.map(caseNote => caseNote.sentBy.username))
    const userDetails: Map<string, undefined | string> = new Map(
      (
        await Promise.all(
          [...uniqueUsers].map(username => {
            return this.hmppsAuthService
              .getUserDetailsByUsername(accessToken, username)
              .then(userDetail => {
                return { username, fullName: userDetail.name }
              })
              .catch(error => {
                return { username, fullName: undefined }
              })
          })
        )
      ).map(user => [user.username, user.fullName])
    )
    const presenter = new CaseNotesPresenter(caseNotesPage, userDetails, serviceUser, loggedInUserType)
    const view = new CaseNotesView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }

  async startAddCaseNote(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const draftCaseNote = await this.draftsService.createDraft('caseNote', null, {
      userId: res.locals.user.userId,
    })

    res.redirect(`/${loggedInUserType}/referrals/${req.params.id}/add-case-note/${draftCaseNote.id}/details`)
  }

  async addCaseNote(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const referralId = req.params.id
    const fetchResult = await this.fetchDraftCaseNoteOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftCaseNote = fetchResult.draft
    let error: FormValidationError | null = null
    let userInputData: Record<string, string> | null = null
    if (req.method === 'POST') {
      const data = await new AddNewCaseNoteForm(req).data(referralId)
      if (!data.error) {
        try {
          await this.draftsService.updateDraft(draftCaseNote.id, data.paramsForUpdate, {
            userId: res.locals.user.userId,
          })
          res.redirect(`/${loggedInUserType}/referrals/${referralId}/add-case-note/${draftCaseNote.id}/check-answers`)
          return
        } catch (e) {
          error = createFormValidationErrorOrRethrow(e as InterventionsServiceError)
          userInputData = req.body
        }
      } else {
        error = data.error
        userInputData = req.body
      }
    }

    const presenter = new AddCaseNotePresenter(referralId, loggedInUserType, draftCaseNote.data, error, userInputData)
    const view = new AddCaseNoteView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }

  async viewCaseNote(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { caseNoteId } = req.params
    const caseNote = await this.interventionsService.getCaseNote(accessToken, caseNoteId)
    const sentByUserDetails = await this.hmppsAuthService.getUserDetailsByUsername(
      accessToken,
      caseNote.sentBy.username
    )
    const sentByUserName = sentByUserDetails.name
    const presenter = new CaseNotePresenter(caseNote, sentByUserName, loggedInUserType)
    const view = new CaseNoteView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }

  async checkCaseNoteAnswers(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const fetchResult = await this.fetchDraftCaseNoteOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult
    if (draft.data === null) {
      // This should never happen. If the draft exists then it should have values due to input validation.
      throw createError(500, `UI-only draft case note with ID ${draft.id} does not contain any data`, {
        userMessage: 'Too much time has passed since you started creating this case note.',
      })
    }

    const loggedInUser = await this.hmppsAuthService.getUserDetails(accessToken)
    const presenter = new CheckAddCaseNoteAnswersPresenter(
      referralId,
      draft.id,
      loggedInUserType,
      loggedInUser,
      draft.data
    )
    const view = new CheckAddCaseNoteAnswersView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }

  async submitCaseNote(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const fetchResult = await this.fetchDraftCaseNoteOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult
    if (draft.data === null) {
      // This should never happen. If the draft exists then it should have values due to input validation.
      throw createError(500, `UI-only draft case note with ID ${draft.id} does not contain any data`, {
        userMessage: 'Too much time has passed since you started creating this case note.',
      })
    }
    await this.interventionsService.addCaseNotes(accessToken, draft.data)
    await this.draftsService.deleteDraft(draft.id, { userId: res.locals.user.userId })
    res.redirect(`/${loggedInUserType}/referrals/${referralId}/case-notes`)
  }

  private async fetchDraftCaseNoteOrRenderMessage(req: Request, res: Response) {
    return ControllerUtils.fetchDraftOrRenderMessage<DraftCaseNote>(req, res, this.draftsService, {
      idParamName: 'draftCaseNoteId',
      notFoundUserMessage:
        'Too much time has passed since you started creating this case note. Your answers have not been saved, and you will need to start again.',
      typeName: 'case note',
    })
  }
}
