import { Request, Response } from 'express'
import ReportAProblemPresenter from './reportAProblemPresenter'
import ReportAProblemView from './reportAProblemView'
import ControllerUtils from '../../utils/controllerUtils'

export default class CommonController {
  async reportAProblem(req: Request, res: Response): Promise<void> {
    const { authSource } = res.locals.user
    const presenter = new ReportAProblemPresenter(authSource === 'delius')
    const view = new ReportAProblemView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }
}
