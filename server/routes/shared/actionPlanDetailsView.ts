import ActionPlanDetailsPresenter from './actionPlanDetailsPresenter'

export default class ActionPlanDetailsView {
  constructor(private readonly presenter: ActionPlanDetailsPresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.interventionProgressURL,
  }

  get actionPlanTagClass(): string {
    switch (this.presenter.text.actionPlanStatus) {
      case 'Approved':
        return 'govuk-tag--green'
      case 'Under review':
        return 'govuk-tag- govuk-tag--red'
      default:
        return 'govuk-tag--grey'
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/actionPlan',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
