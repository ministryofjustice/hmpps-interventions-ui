import { SummaryListArgs } from '../../../../utils/govukFrontendTypes'
import { SummaryListItem } from '../../../../utils/summaryList'
import ViewUtils from '../../../../utils/viewUtils'
import AddCaseNoteCheckAnswersPresenter from './addCaseNoteCheckAnswersPresenter'

export default class AddCaseNoteCheckAnswersView {
  constructor(private presenter: AddCaseNoteCheckAnswersPresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.backLinkHref,
  }

  private get caseNoteSummaryListArgs(): SummaryListArgs {
    const caseNotesSummaryListItem: SummaryListItem[] = []

    caseNotesSummaryListItem.push(
      { key: 'Subject', lines: [this.presenter.caseNoteSummary.subject] },
      { key: 'Date', lines: [this.presenter.caseNoteSummary.date] },
      { key: 'Time', lines: [this.presenter.caseNoteSummary.time] },
      { key: 'From', lines: [this.presenter.caseNoteSummary.from] },
      {
        key: 'Notes about the intervention or the person on probation',
        lines: [this.presenter.caseNoteSummary.body],
      }
    )
    if (this.presenter.loggedInUserType === 'service-provider') {
      caseNotesSummaryListItem.push({
        key: 'Would you like the probation practitioner to get an email about this case note?',
        lines: [this.presenter.caseNoteSummary.sendEmail],
      })
    }

    return ViewUtils.summaryListArgsWithSummaryCard(caseNotesSummaryListItem, this.presenter.caseNoteDetailsHeading, {
      showBorders: true,
      showTitle: true,
    })
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'caseNotes/checkAnswers',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        caseNoteSummaryListArgs: this.caseNoteSummaryListArgs,
      },
    ]
  }
}
