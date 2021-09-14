import { TableArgs } from '../../../utils/govukFrontendTypes'
import CaseNotesPresenter from './caseNotesPresenter'
import ViewUtils from '../../../utils/viewUtils'
import PresenterUtils from '../../../utils/presenterUtils'

export default class CaseNotesView {
  constructor(private presenter: CaseNotesPresenter) {}

  private get tableArgs(): TableArgs {
    if (this.presenter.tableRows.length === 0) {
      return { rows: [] }
    }

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
                    <br><br>${ViewUtils.nl2br(
                      ViewUtils.escape(PresenterUtils.truncateCharacters(row.body, 250, { addEllipsis: true }))
                    )}
                    <p/><a href="${row.caseNoteLink}" class="govuk-link">Read More</a>
                    </p>`,
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
        serviceUserName: this.presenter.serviceUserName,
      },
    ]
  }
}
