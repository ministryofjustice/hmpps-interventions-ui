import { TableArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import MyCasesPresenter from './myCasesPresenter'

export default class MyCasesView {
  constructor(private readonly presenter: MyCasesPresenter) {}

  private get tableArgs(): TableArgs {
    const { tableHeadings, tableRows } = this.presenter
    return ViewUtils.sortableTable(tableHeadings, tableRows)
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/myCases',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
      },
    ]
  }
}
