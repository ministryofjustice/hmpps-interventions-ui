import { Request, Response } from 'express'
import createError from 'http-errors'
import InterventionsService, { InterventionsServiceError } from '../../services/interventionsService'
import CaseNotesPresenter from './viewAll/caseNotesPresenter'
import CaseNotesView from './viewAll/caseNotesView'
import ControllerUtils from '../../utils/controllerUtils'
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
import AddCaseNoteConfirmationPresenter from './add/confirmation/addCaseNoteConfirmationPresenter'
import AddCaseNoteConfirmationView from './add/confirmation/addCaseNoteConfirmationView'
import RamDeliusApiService from '../../services/ramDeliusApiService'

export type DraftCaseNote = null | CaseNote

export default class CaseNotesController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly ramDeliusApiService: RamDeliusApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly draftsService: DraftsService
  ) {}

  async showCaseNotes(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const pageNumber = req.query.page
    const paginationQuery = {
      page: pageNumber ? Number(pageNumber) : undefined,
      size: 5,
      sort: ['sentAt,DESC'],
    }
    const referralId = req.params.id
    const [referral, caseNotesPage] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getCaseNotes(accessToken, referralId, paginationQuery),
    ])
    const intervention = await this.interventionsService.getIntervention(accessToken, referral.referral.interventionId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
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
    const presenter = new CaseNotesPresenter(
      referralId,
      intervention,
      caseNotesPage,
      userDetails,
      serviceUser,
      loggedInUserType,
      req.session.dashboardOriginPage
    )
    const view = new CaseNotesView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id

    const referral = await Promise.resolve(this.interventionsService.getSentReferral(accessToken, referralId))
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const fetchResult = await this.fetchDraftCaseNoteOrRenderMessage(req, res, loggedInUserType)
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
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewCaseNote(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { caseNoteId } = req.params

    const backlinkPageNumber = ControllerUtils.parseQueryParamAsPositiveInteger(req, 'backlinkPageNumber')

    const caseNote = await this.interventionsService.getCaseNote(accessToken, caseNoteId)
    const sentByUserDetails = await this.hmppsAuthService.getUserDetailsByUsername(
      accessToken,
      caseNote.sentBy.username
    )

    const referral = await Promise.resolve(this.interventionsService.getSentReferral(accessToken, caseNote.referralId))
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const sentByUserName = sentByUserDetails.name
    const presenter = new CaseNotePresenter(caseNote, sentByUserName, loggedInUserType, backlinkPageNumber)
    const view = new CaseNoteView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async checkCaseNoteAnswers(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const fetchResult = await this.fetchDraftCaseNoteOrRenderMessage(req, res, loggedInUserType)
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
    const fetchResult = await this.fetchDraftCaseNoteOrRenderMessage(req, res, loggedInUserType)
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
    res.redirect(`/${loggedInUserType}/referrals/${referralId}/add-case-note/confirmation`)
  }

  async addCaseNoteConfirmation(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const presenter = new AddCaseNoteConfirmationPresenter(sentReferral, intervention, loggedInUserType)
    const view = new AddCaseNoteConfirmationView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }

  private async fetchDraftCaseNoteOrRenderMessage(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {
    const backLink = {
      target: `/${loggedInUserType}/referrals/${req.params.id}/case-notes`,
      message: 'go to case notes',
    }
    return ControllerUtils.fetchDraftOrRenderMessage<DraftCaseNote>(req, res, this.draftsService, {
      idParamName: 'draftCaseNoteId',
      notFoundUserMessage:
        'You have not sent this case note. This is because too much time has passed since you started it.',
      typeName: 'case note',
      backLink,
    })
  }
}
