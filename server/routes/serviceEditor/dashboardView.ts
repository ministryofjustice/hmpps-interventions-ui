import ViewUtils from '../../utils/viewUtils'
import DashboardPresenter from './dashboardPresenter'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceEditor/dashboard',
      {
        presenter: this.presenter,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.primaryNavBarPresenter.items),
        services: this.presenter.serviceTitlesAndSummaries.reduce((acc, titleAndSummary) => {
          acc[titleAndSummary[0]] = ViewUtils.summaryListArgs(titleAndSummary[1])
          return acc
        }, {}),
      },
    ]
  }
}
