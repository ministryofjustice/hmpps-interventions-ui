import config from '../../config'

export default class CrsLandingPagePresenter {
  readonly findInterventionsUrl: string

  readonly viewReferral: string

  readonly backLinkUrl: string

  constructor(
    private readonly bannerDisable: boolean,
    private readonly crsHomePage: string
  ) {
    this.findInterventionsUrl = '/find-interventions'
    this.viewReferral = '/probation-practitioner/dashboard'
    this.backLinkUrl = `${config.findAndRefer.url}/interventions-homepage`
  }

  readonly pageHeading = 'Commissioned Rehabilitative Services (CRS)'

  readonly closeHref = `${this.crsHomePage}?dismissDowntimeBanner=true`

  readonly disableDowntimeBanner = this.bannerDisable
}
