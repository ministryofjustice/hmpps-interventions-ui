import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'
import InterventionsService from '../../services/interventionsService'
import CommunityApiService from '../../services/communityApiService'
import { FormValidationError } from '../../utils/formValidationError'
import ChangelogPresenter from './changelog/changelogPresenter'
import ChangelogView from './changelog/changelogView'
import ChangelogDetailPresenter from './changelogDetail/changelogDetailPresenter'
import ChangelogDetailView from './changelogDetail/changelogDetailView'

export default class ChangeLogController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

  async getChangelog(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    const formError: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const changeLog = await this.interventionsService.getChangelog(accessToken, referralId)
    const [serviceUser] = await Promise.all([
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])
    const presenter = new ChangelogPresenter(formError, changeLog, referralId, loggedInUserType)
    const view = new ChangelogView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async getChangelogDetails(
    req: Request,
    res: Response,
    loggedInUserType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId, changelogId } = req.params
    const formError: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const changeLogDetail = await this.interventionsService.getChangelogDetail(accessToken, changelogId)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const presenter = new ChangelogDetailPresenter(
      formError,
      changeLogDetail,
      sentReferral,
      serviceUser,
      loggedInUserType
    )
    const view = new ChangelogDetailView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }
}
