import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'

export default class CommonController {
  async reportAProblem(req: Request, res: Response): Promise<void> {
    ControllerUtils.renderWithLayout(res, { renderArgs: ['common/reportAProblem', {}] }, null)
  }

  async deliverySchedule(req: Request, res: Response): Promise<void> {
    ControllerUtils.renderWithLayout(res, { renderArgs: ['common/deliverySchedule', {}] }, null)
  }
}
