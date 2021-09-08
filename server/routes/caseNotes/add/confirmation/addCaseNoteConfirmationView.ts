import ViewUtils from '../../../../utils/viewUtils'
import AddCaseNoteConfirmationPresenter from './addCaseNoteConfirmationPresenter'

export default class AddCaseNoteConfirmationView {
  constructor(private presenter: AddCaseNoteConfirmationPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.serviceUserSummary)
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'caseNotes/addNewCaseNoteConfirmation',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}
