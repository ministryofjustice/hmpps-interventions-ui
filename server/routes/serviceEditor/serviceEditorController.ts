import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'
import DashboardView from './dashboardView'
import DashboardPresenter from './dashboardPresenter'
import InterventionsService from '../../services/interventionsService'

export default class ServiceEditorController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async dashboard(req: Request, res: Response): Promise<void> {
    const interventions = await this.interventionsService.getMyInterventions(res.locals.user.token.accessToken)
    const presenter = new DashboardPresenter(res.locals.user, interventions)
    const view = new DashboardView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }
}
