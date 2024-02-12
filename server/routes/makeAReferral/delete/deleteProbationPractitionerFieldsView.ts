import DeleteProbationPractitionerFieldsPresenter from './deleteProbationPractitionerFieldsPresenter'

export default class DeleteProbationPractitionerPhoneNumberView {
  constructor(private readonly presenter: DeleteProbationPractitionerFieldsPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/deleteProbationPractitionerFields',
      {
        presenter: this.presenter,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}
