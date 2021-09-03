import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import CaseNotesPresenter from './caseNotesPresenter'
import CaseNotesView from './caseNotesView'
import ControllerUtils from '../../utils/controllerUtils'

export default class CaseNotesController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async showCaseNotes(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const paginationQuery = {
      page: Number(req.query.page),
      size: 5,
    }
    const caseNotesPage = await this.interventionsService.getCaseNotes(accessToken, req.params.id, paginationQuery)
    const presenter = new CaseNotesPresenter(caseNotesPage)
    const view = new CaseNotesView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }
}
