import { InsetTextArgs } from '../../../../utils/govukFrontendTypes'
import ReviewActionPlanPresenter from './reviewActionPlanPresenter'

export default class ReviewActionPlanView {
  constructor(private readonly presenter: ReviewActionPlanPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/reviewActionPlan',
      {
        presenter: this.presenter,
        insetTextArgs: this.insetTextArgs,
      },
    ]
  }

  insetTextArgs(index: number, description: string): InsetTextArgs {
    return {
      html: `<h3 class="govuk-heading-m govuk-!-font-weight-bold">Activity ${index}</h3><p class="govuk-body">${description}</p>`,
      classes: 'app-inset-text--grey',
    }
  }
}
