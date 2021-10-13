import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'

export default class ServiceEditorController {
  async dashboard(req: Request, res: Response): Promise<void> {
    ControllerUtils.renderWithLayout(res, { renderArgs: ['serviceEditor/dashboard', {}] }, null)
  }
}
