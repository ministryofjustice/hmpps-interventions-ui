import config from '../../config'

export default class CrsLandingPagePresenter {
  readonly findInterventionsUrl: string

  readonly viewReferral: string

  readonly backLinkUrl: string

  constructor() {
    this.findInterventionsUrl = '/find-interventions'
    this.viewReferral = '/probation-practitioner/dashboard'
    this.backLinkUrl = `${config.findAndRefer.url}/interventions-homepage`
  }

  readonly pageHeading = 'Commissioned Rehabilitative Services (CRS)'
}
