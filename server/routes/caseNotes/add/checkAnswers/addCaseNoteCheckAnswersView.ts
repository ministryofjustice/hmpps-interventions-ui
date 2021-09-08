import { SummaryListArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import AddCaseNoteCheckAnswersPresenter from './addCaseNoteCheckAnswersPresenter'

export default class AddCaseNoteCheckAnswersView {
  constructor(private presenter: AddCaseNoteCheckAnswersPresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.backLinkHref,
  }

  private get caseNoteSummaryListArgs(): SummaryListArgs {
    return ViewUtils.summaryListArgs(
      [
        { key: 'Subject', lines: [this.presenter.caseNoteSummary.subject] },
        { key: 'Date', lines: [this.presenter.caseNoteSummary.date] },
        { key: 'Time', lines: [this.presenter.caseNoteSummary.time] },
        { key: 'From', lines: [this.presenter.caseNoteSummary.from] },
      ],
      { showBorders: false }
    )
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'caseNotes/checkAnswers',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        caseNoteSummaryListArgs: this.caseNoteSummaryListArgs,
        caseNoteBody: this.presenter.caseNoteSummary.body,
      },
    ]
  }
}
