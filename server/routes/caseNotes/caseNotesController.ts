import { Request, Response } from 'express'
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
import { CaseNote } from '../../models/caseNote'

export type DraftCaseNote = null | CaseNote

export default class CaseNotesController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly draftsService: DraftsService
  ) {}

  async showCaseNotes(req: Request, res: Response): Promise<void> {
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
    const presenter = new CaseNotesPresenter(caseNotesPage, userDetails, serviceUser)
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
    const { accessToken } = res.locals.user.token
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
          await this.interventionsService.addCaseNotes(accessToken, data.paramsForUpdate)
          res.redirect(`/${loggedInUserType}/referrals/${referralId}/case-notes`)
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

  private async fetchDraftCaseNoteOrRenderMessage(req: Request, res: Response) {
    return ControllerUtils.fetchDraftOrRenderMessage<DraftCaseNote>(req, res, this.draftsService, {
      idParamName: 'draftCaseNoteId',
      notFoundUserMessage:
        'Too much time has passed since you started creating this case note. Your answers have not been saved, and you will need to start again.',
      typeName: 'case note',
    })
  }
}
