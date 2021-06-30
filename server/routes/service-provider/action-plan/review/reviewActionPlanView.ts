import ReviewActionPlanPresenter from './reviewActionPlanPresenter'
import ActionPlanView from '../../../shared/action-plan/actionPlanView'

export default class ReviewActionPlanView {
  actionPlanView: ActionPlanView

  constructor(private readonly presenter: ReviewActionPlanPresenter) {
    this.actionPlanView = new ActionPlanView(presenter.actionPlanPresenter)
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/reviewActionPlan',
      {
        presenter: this.presenter,
        insetTextArgs: this.actionPlanView.insetTextActivityArgs,
      },
    ]
  }
}
