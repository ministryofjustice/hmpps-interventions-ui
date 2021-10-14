import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'
import DashboardView from './dashboardView'

export default class ServiceEditorController {
  async dashboard(req: Request, res: Response): Promise<void> {
    const view = new DashboardView(res.locals.user)
    ControllerUtils.renderWithLayout(res, view, null)
  }
}
