import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import DashboardPresenter from './dashboardPresenter'
import DashboardView from './dashboardView'

export default class ProbationPractitionerReferralsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async showDashboard(req: Request, res: Response): Promise<void> {
    const { token, userId } = res.locals.user

    const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUser(token, userId)
    const presenter = new DashboardPresenter(existingDraftReferrals)
    const view = new DashboardView(presenter)

    res.render(...view.renderArgs)
  }
}
