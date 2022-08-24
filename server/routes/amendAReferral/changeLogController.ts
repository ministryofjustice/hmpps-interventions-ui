import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'
import InterventionsService from '../../services/interventionsService'
import CommunityApiService from '../../services/communityApiService'
import { FormValidationError } from '../../utils/formValidationError'
import ChangelogPresenter from './changelog/changelogPresenter'
import ChangelogView from './changelog/changelogView'

export default class ChangeLogController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

  async getChangelog(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    const formError: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const changeLog = await this.interventionsService.getChangelog(accessToken, referralId)
    const [serviceUser] = await Promise.all([
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])
    const presenter = new ChangelogPresenter(formError, changeLog, referralId, 'probation-practitioner')
    const view = new ChangelogView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }
}
