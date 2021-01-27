import DashboardPresenter from './dashboardPresenter'

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
          const result = { text: cell.text, attributes: {} }
          if (cell.sortValue !== null) {
            result.attributes = { 'data-sort-value': cell.sortValue }
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
