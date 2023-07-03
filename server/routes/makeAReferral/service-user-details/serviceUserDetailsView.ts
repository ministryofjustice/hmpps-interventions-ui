import ViewUtils from '../../../utils/viewUtils'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'

export default class ServiceUserDetailsView {
  constructor(private readonly presenter: ServiceUserDetailsPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.summary)
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/serviceUserDetails',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}
