import ViewUtils from '../../../../utils/viewUtils'
import ActionPlanConfirmationPresenter from './actionPlanConfirmationPresenter'

export default class ActionPlanConfirmationView {
  constructor(private readonly presenter: ActionPlanConfirmationPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.summary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/actionPlanConfirmation',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}
