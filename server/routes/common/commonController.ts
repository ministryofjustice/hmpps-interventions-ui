import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'

export default class CommonController {
  async reportAProblem(req: Request, res: Response): Promise<void> {
    await ControllerUtils.renderWithLayout(req, res, { renderArgs: ['common/reportAProblem', {}] }, null, null)
  }

  async deliverySchedule(req: Request, res: Response): Promise<void> {
    await ControllerUtils.renderWithLayout(req, res, { renderArgs: ['common/deliverySchedule', {}] }, null, null)
  }

  async accessibilityStatement(req: Request, res: Response): Promise<void> {
    await ControllerUtils.renderWithLayout(req, res, { renderArgs: ['common/accessibilityStatement', {}] }, null, null)
  }
}
