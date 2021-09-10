import { SummaryListArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import CaseNotePresenter from './caseNotePresenter'

export default class CaseNoteView {
  constructor(private presenter: CaseNotePresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.backLinkHref,
  }

  private get caseNoteSummaryListArgs(): SummaryListArgs {
    return ViewUtils.summaryListArgs(
      [
        { key: 'Date', lines: [this.presenter.caseNoteSummary.date] },
        { key: 'Time', lines: [this.presenter.caseNoteSummary.time] },
        { key: 'From', lines: [this.presenter.caseNoteSummary.from] },
      ],
      { showBorders: false }
    )
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'caseNotes/caseNote',
      {
        presenter: this.presenter,
        caseNoteSubject: this.presenter.caseNoteSummary.subject,
        backLinkArgs: this.backLinkArgs,
        caseNoteSummaryListArgs: this.caseNoteSummaryListArgs,
        caseNoteBody: this.presenter.caseNoteSummary.body,
      },
    ]
  }
}
