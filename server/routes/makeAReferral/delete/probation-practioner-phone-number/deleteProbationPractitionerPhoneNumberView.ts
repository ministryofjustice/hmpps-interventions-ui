import DeleteProbationPractitionerPhoneNumberPresenter from './deleteProbationPractitionerPhoneNumberPresenter'

export default class DeleteProbationPractitionerPhoneNumberView {
  constructor(private readonly presenter: DeleteProbationPractitionerPhoneNumberPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/deleteProbationPractitionerPhoneNumber',
      {
        presenter: this.presenter,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}
