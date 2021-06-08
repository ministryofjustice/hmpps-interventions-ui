export default class ReportAProblemPresenter {
  constructor(public readonly ppUser: boolean) {}

  get email(): string {
    return 'refer-and-monitor-feedback@digital.justice.gov.uk'
  }
}
