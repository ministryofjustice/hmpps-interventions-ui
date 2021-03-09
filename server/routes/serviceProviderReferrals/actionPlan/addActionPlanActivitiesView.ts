import AddActionPlanActivitiesPresenter from './addActionPlanActivitiesPresenter'

export default class AddActionPlanActivitiesView {
  constructor(private readonly presenter: AddActionPlanActivitiesPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/actionPlan/addActivities',
      {
        presenter: this.presenter,
      },
    ]
  }
}
