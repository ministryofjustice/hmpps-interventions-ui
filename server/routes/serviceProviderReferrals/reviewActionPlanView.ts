import ReviewActionPlanPresenter from './reviewActionPlanPresenter'

export default class ReviewActionPlanView {
  constructor(private readonly presenter: ReviewActionPlanPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/reviewActionPlan',
      {
        presenter: this.presenter,
      },
    ]
  }
}
