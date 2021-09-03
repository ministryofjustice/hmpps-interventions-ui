import { TableArgs } from '../../utils/govukFrontendTypes'
import CaseNotesPresenter from './caseNotesPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class CaseNotesView {
  constructor(private presenter: CaseNotesPresenter) {}

  private get tableArgs(): TableArgs {
    return {
      head: [
        { text: 'Details', classes: 'govuk-!-width-one-quarter' },
        { text: 'Case notes', classes: 'govuk-!-width-three-quarters' },
      ],
      rows: this.presenter.tableRows.map(row => {
        return [
          {
            html: `<p class="govuk-body">${row.sentAtDay}<br>${row.sentAtDate}<br>${row.sentAtTime}<br>${row.sentBy}</p>`,
          },
          {
            html: `<p class="govuk-body">
                    <b>${ViewUtils.escape(row.subject)}</b>
                    <br><br>${ViewUtils.nl2br(ViewUtils.escape(row.body))}</p>`,
          },
        ]
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'caseNotes/caseNotes',
      {
        pagination: this.presenter.pagination.mojPaginationArgs,
        tableArgs: this.tableArgs,
      },
    ]
  }
}
