import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import ControllerUtils from '../../utils/controllerUtils'
import InterventionDetailsPresenter from './interventionDetailsPresenter'
import InterventionDetailsView from './interventionDetailsView'
import InterventionsFilter from './interventionsFilter'
import SearchResultsPresenter from './searchResultsPresenter'
import SearchResultsView from './searchResultsView'
import CrsLandingPagePresenter from '../probationPractitionerReferrals/crsLandingPagePresenter'
import CrsLandingPageView from '../probationPractitionerReferrals/crsLandingPageView'

export default class FindInterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async search(req: Request, res: Response): Promise<void> {
    if (req.query.dismissDowntimeBanner) {
      req.session.disableDowntimeBanner = true
    }
    const filter = InterventionsFilter.fromRequest(req)

    const [interventions, pccRegions] = await Promise.all([
      this.interventionsService.getInterventions(res.locals.user.token.accessToken, filter.params),
      this.interventionsService.getPccRegions(res.locals.user.token.accessToken),
    ])

    req.session.findInterventionOriginPage = req.originalUrl
    const disablePlannedDowntimeNotification = req.session.disableDowntimeBanner
      ? req.session.disableDowntimeBanner
      : false

    const presenter = new SearchResultsPresenter(
      interventions,
      filter,
      pccRegions,
      disablePlannedDowntimeNotification,
      req.session.findInterventionOriginPage,
      res.locals.user
    )
    const view = new SearchResultsView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, null, 'probation-practitioner')
  }

  async viewInterventionDetails(req: Request, res: Response): Promise<void> {
    const intervention = await this.interventionsService.getIntervention(
      res.locals.user.token.accessToken,
      req.params.id
    )

    const presenter = new InterventionDetailsPresenter(intervention, res.locals.user)
    const view = new InterventionDetailsView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, null, 'probation-practitioner')
  }

  async showIndex(req: Request, res: Response): Promise<void> {
    if (req.query.dismissDowntimeBanner) {
      req.session.disableDowntimeBanner = true
    }
    req.session.crsHomePage = req.originalUrl
    const disablePlannedDowntimeNotification = req.session.disableDowntimeBanner
      ? req.session.disableDowntimeBanner
      : false
    const presenter = new CrsLandingPagePresenter(disablePlannedDowntimeNotification, req.session.crsHomePage)
    const view = new CrsLandingPageView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, null, 'probation-practitioner')
  }
}
