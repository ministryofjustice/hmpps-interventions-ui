import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import SearchResultsPresenter from './searchResultsPresenter'
import SearchResultsView from './searchResultsView'

export default class FindInterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async search(req: Request, res: Response): Promise<void> {
    const interventions = await this.interventionsService.getInterventions(res.locals.user.token)

    const presenter = new SearchResultsPresenter(interventions)
    const view = new SearchResultsView(presenter)

    res.render(...view.renderArgs)
  }
}
