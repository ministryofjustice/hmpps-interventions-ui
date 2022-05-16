import EndOfServiceReportAnswersView from '../endOfServiceReportAnswersView'
import EndOfServiceReportPresenter from './endOfServiceReportPresenter'

export default class EndOfServiceReportView {
  constructor(
    private readonly presenter: EndOfServiceReportPresenter,
    private readonly serviceProviderReferralProgress?: string
  ) {}

  private readonly answersView = new EndOfServiceReportAnswersView(this.presenter.answersPresenter)

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.hrefBackLink,
  }

  readonly renderArgs: [string, Record<string, unknown>] = [
    'shared/endOfServiceReport',
    {
      backLinkArgs: this.backLinkArgs,
      presenter: this.presenter,
      ...this.answersView.locals,
    },
  ]
}
