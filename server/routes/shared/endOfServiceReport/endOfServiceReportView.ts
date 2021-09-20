import EndOfServiceReportAnswersView from '../endOfServiceReportAnswersView'
import EndOfServiceReportPresenter from './endOfServiceReportPresenter'

export default class EndOfServiceReportView {
  constructor(private readonly presenter: EndOfServiceReportPresenter) {}

  private readonly answersView = new EndOfServiceReportAnswersView(this.presenter.answersPresenter)

  readonly renderArgs: [string, Record<string, unknown>] = [
    'shared/endOfServiceReport',
    {
      presenter: this.presenter,
      ...this.answersView.locals,
    },
  ]
}
