import DashboardPresenter from './dashboardPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TableArgs } from '../../utils/govukFrontendTypes'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs(): TableArgs {
    const { tableHeadings, tableRows } = this.presenter
    return ViewUtils.sortableTable(tableHeadings, tableRows)
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return ['serviceProviderReferrals/dashboard', { tableArgs: this.tableArgs }]
  }
}
