import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import DashboardPresenter from './dashboardPresenter'
import DashboardView from './dashboardView'

export default class ServiceProviderReferralsController {
  constructor(private readonly interventionsService: InterventionsService) {}

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
}
