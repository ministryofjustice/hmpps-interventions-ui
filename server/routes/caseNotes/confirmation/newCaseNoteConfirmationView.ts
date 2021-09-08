import ViewUtils from '../../../utils/viewUtils'
import NewCaseNoteConfirmationPresenter from './newCaseNoteConfirmationPresenter'

export default class NewCaseNoteConfirmationView {
  constructor(private presenter: NewCaseNoteConfirmationPresenter) {}

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
