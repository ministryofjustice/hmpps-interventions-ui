import ReviewActionPlanPresenter from './reviewActionPlanPresenter'
import ActionPlanView from '../../../shared/action-plan/actionPlanView'

export default class ReviewActionPlanView {
  actionPlanView: ActionPlanView

  constructor(private readonly presenter: ReviewActionPlanPresenter) {
    this.actionPlanView = new ActionPlanView(presenter.actionPlanPresenter)
  }

  private readonly backLinkArgs = {
    text: 'Back',
    href: `/service-provider/action-plan/${this.presenter.actionPlanId}/number-of-sessions`,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/reviewActionPlan',
      {
        presenter: this.presenter,
        insetTextArgs: this.actionPlanView.insetTextActivityArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
