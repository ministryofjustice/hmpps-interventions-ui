import ReportAProblemPresenter from './reportAProblemPresenter'

export default class ReportAProblemView {
  constructor(private readonly presenter: ReportAProblemPresenter) {}

  get content(): string {
    if (this.presenter.ppUser) {
      return `<p>To report a problem with this digital service, please email <a href="mailto:${this.presenter.email}">${this.presenter.email}</a></p>`
    }
    return `<p>To report a problem with this digital service, please contact your helpdesk who will contact the digital service team if necessary.</p>
    <p>If your organisation does not have an IT helpdesk, please email <a href="mailto:${this.presenter.email}">${this.presenter.email}</a></p>`
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'common/reportAProblem',
      {
        presenter: this.presenter,
        content: this.content,
      },
    ]
  }
}
