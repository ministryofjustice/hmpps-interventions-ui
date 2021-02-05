import DashboardPresenter from './dashboardPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs() {
    return {
      head: this.presenter.tableHeadings.map(heading => {
        return {
          text: heading,
          attributes: {
            'aria-sort': 'none',
          },
        }
      }),
      rows: this.presenter.tableRows.map(row => {
        return row.map(cell => {
          const result: Record<string, unknown> = {}

          if (cell.sortValue !== null) {
            result.attributes = { 'data-sort-value': cell.sortValue }
          }

          if (cell.href === null) {
            result.text = cell.text
          } else {
            result.html = `<a href="${cell.href}" class="govuk-link">${ViewUtils.escape(cell.text)}</a>`
          }

          return result
        })
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return ['serviceProviderReferrals/dashboard', { tableArgs: this.tableArgs }]
  }
}
