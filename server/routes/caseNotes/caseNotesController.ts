import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import CaseNotesPresenter from './caseNotesPresenter'
import CaseNotesView from './caseNotesView'
import ControllerUtils from '../../utils/controllerUtils'
import HmppsAuthService from '../../services/hmppsAuthService'

export default class CaseNotesController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly hmppsAuthService: HmppsAuthService
  ) {}

  async showCaseNotes(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const paginationQuery = {
      page: Number(req.query.page),
      size: 5,
    }
    const caseNotesPage = await this.interventionsService.getCaseNotes(accessToken, req.params.id, paginationQuery)
    const uniqueUsers = new Set(caseNotesPage.content.map(caseNote => caseNote.sentBy.username))
    const userDetails: Map<string, undefined | string> = new Map(
      (
        await Promise.all(
          [...uniqueUsers].map(username => {
            return this.hmppsAuthService
              .getUserDetailsByUsername(accessToken, username)
              .then(userDetail => {
                return { username, fullName: userDetail.name }
              })
              .catch(error => {
                return { username, fullName: undefined }
              })
          })
        )
      ).map(user => [user.username, user.fullName])
    )
    const presenter = new CaseNotesPresenter(caseNotesPage, userDetails)
    const view = new CaseNotesView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }
}
