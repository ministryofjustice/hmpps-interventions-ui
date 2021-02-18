import { Request, Response } from 'express'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService from '../../services/interventionsService'
import DashboardPresenter from './dashboardPresenter'
import DashboardView from './dashboardView'
import ShowReferralPresenter from './showReferralPresenter'
import ShowReferralView from './showReferralView'

export default class ServiceProviderReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

  async showDashboard(req: Request, res: Response): Promise<void> {
    const referrals = await this.interventionsService.getSentReferrals(res.locals.user.token)

    const dedupedServiceCategoryIds = Array.from(
      new Set(referrals.map(referral => referral.referral.serviceCategoryId))
    )
    const serviceCategories = await Promise.all(
      dedupedServiceCategoryIds.map(id => this.interventionsService.getServiceCategory(res.locals.user.token, id))
    )

    const presenter = new DashboardPresenter(referrals, serviceCategories)
    const view = new DashboardView(presenter)

    res.render(...view.renderArgs)
  }

  async showReferral(req: Request, res: Response): Promise<void> {
    const sentReferral = await this.interventionsService.getSentReferral(res.locals.user.token, req.params.id)
    const [serviceCategory, sentBy, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token, sentReferral.referral.serviceCategoryId),
      this.communityApiService.getUserByUsername(sentReferral.sentBy.username),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ShowReferralPresenter(sentReferral.referral, serviceCategory, sentBy, serviceUser)
    const view = new ShowReferralView(presenter)

    res.render(...view.renderArgs)
  }
}
