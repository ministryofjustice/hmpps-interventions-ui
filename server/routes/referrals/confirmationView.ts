import ConfirmationPresenter from './confirmationPresenter'

export default class ConfirmationView {
  constructor(private readonly presenter: ConfirmationPresenter) {}

  private readonly panelArgs = {
    titleText: this.presenter.text.title,
    html: `${this.presenter.text.referenceNumberIntro}<br><strong>${this.presenter.text.referenceNumber}`,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/confirmation',
      {
        presenter: this.presenter,
        panelArgs: this.panelArgs,
      },
    ]
  }
}
