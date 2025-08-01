export default class CrsLandingPagePresenter {
  readonly findInterventionsUrl: string

  readonly viewReferral: string

  readonly backLinkUrl: string

  constructor() {
    this.findInterventionsUrl = '/find-interventions'
    this.viewReferral = '/probation-practitioner/dashboard'
    this.backLinkUrl = '#'
  }

  readonly pageHeading = 'Commissioned Rehabilitative Service (CRS)'
}
