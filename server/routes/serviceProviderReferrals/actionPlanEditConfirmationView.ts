import ActionPlanEditConfirmationPresenter from './actionPlanEditConfirmationPresenter'

export default class ActionPlanEditConfirmationView {
  constructor(private readonly presenter: ActionPlanEditConfirmationPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/actionPlan/actionPlanEditConfirmation',
      {
        presenter: this.presenter,
        backLinkArgs: {
          text: 'Back',
          href: this.presenter.viewActionPlanUrl,
        },
      },
    ]
  }
}
