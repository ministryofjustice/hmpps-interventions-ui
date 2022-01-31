import ViewUtils from '../../../../utils/viewUtils'
import AddActionPlanActivitiesPresenter from './addActionPlanActivitiesPresenter'
import { BackLinkArgs } from '../../../../utils/govukFrontendTypes'

export default class AddActionPlanActivitiesView {
  constructor(private readonly presenter: AddActionPlanActivitiesPresenter) {}

  private get backLinkArgs(): BackLinkArgs {
    return {
      text: 'Back',
      href: this.presenter.backLinkHref,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/actionPlan/addActivities',
      {
        presenter: this.presenter,
        addActivityTextareaArgs: this.addActivityTextareaArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private readonly addActivityTextareaArgs = {
    name: 'description',
    id: 'description',
    label: {
      html: `<h2 class="govuk-heading-m">${ViewUtils.escape(`Activity ${this.presenter.activityNumber}`)}</h2>`,
    },
    hint: {
      text: 'Please write the details of the activity here.',
    },
    value: this.presenter.existingActivity?.description,
    errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
  }
}
