import EndOfServiceReportAnswersView from '../shared/endOfServiceReportAnswersView'
import EndOfServiceReportCheckAnswersPresenter from './endOfServiceReportCheckAnswersPresenter'

export default class EndOfServiceReportCheckAnswersView {
  constructor(private readonly presenter: EndOfServiceReportCheckAnswersPresenter) {}

  private readonly answersView = new EndOfServiceReportAnswersView(this.presenter.answersPresenter)

  readonly renderArgs: [string, Record<string, unknown>] = [
    'serviceProviderReferrals/endOfServiceReport/checkAnswers',
    {
      presenter: this.presenter,
      ...this.answersView.locals,
    },
  ]
}
