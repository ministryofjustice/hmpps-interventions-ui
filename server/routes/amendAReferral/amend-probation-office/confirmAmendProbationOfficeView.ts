import ConfirmAmendProbationOfficePresenter from './confirmAmendProbationOfficePresenter'

export default class ConfirmAmendProbationOfficeView {
  constructor(private readonly presenter: ConfirmAmendProbationOfficePresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/confirmAmendProbationOffice',
      {
        presenter: this.presenter,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}
