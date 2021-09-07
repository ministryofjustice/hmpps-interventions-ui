import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import CaseNotesPresenter from './viewAll/caseNotesPresenter'
import CaseNotesView from './viewAll/caseNotesView'
import ControllerUtils from '../../utils/controllerUtils'
import CommunityApiService from '../../services/communityApiService'
import HmppsAuthService from '../../services/hmppsAuthService'

export default class CaseNotesController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService
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
}
