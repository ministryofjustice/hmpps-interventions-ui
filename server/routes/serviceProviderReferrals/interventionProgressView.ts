import { TagArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'

import ViewUtils from '../../utils/viewUtils'
import InterventionProgressPresenter from './interventionProgressPresenter'

export default class InterventionProgressView {
  constructor(private readonly presenter: InterventionProgressPresenter) {}

  private initialAssessmentSummaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs {
    return {
      rows: [
        {
          key: { text: 'Date' },
          value: { text: '' },
        },
        {
          key: { text: 'Time' },
          value: { text: '' },
        },
        {
          key: { text: 'Address' },
          value: { text: '' },
        },
        {
          key: { text: 'Appointment status' },
          value: { html: tagMacro({ text: 'Not scheduled', classes: 'govuk-tag--grey' }) },
        },
        {
          key: { text: 'Action' },
          value: { html: '<a href="#" class="govuk-link">Schedule</a>' },
        },
      ],
    }
  }

  private actionPlanSummaryListArgs(tagMacro: (args: TagArgs) => string, csrfToken: string): SummaryListArgs {
    return {
      rows: [
        {
          key: { text: 'Action plan status' },
          value: { text: tagMacro({ text: this.presenter.text.actionPlanStatus, classes: this.actionPlanTagClass }) },
        },
        {
          key: { text: 'Action' },
          value: {
            html: `<form method="post" action="${ViewUtils.escape(this.presenter.createActionPlanFormAction)}">
                     <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken)}">
                     <button class="govuk-button govuk-button--secondary">
                       Create action plan
                     </button>
                   </form>`,
          },
        },
      ],
    }
  }

  private readonly actionPlanTagClass = this.presenter.actionPlanStatusStyle === 'active' ? '' : 'govuk-tag--grey'

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/interventionProgress',
      {
        presenter: this.presenter,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        serviceUserBannerArgs: this.presenter.referralOverviewPagePresenter.serviceUserBannerArgs,
        initialAssessmentSummaryListArgs: this.initialAssessmentSummaryListArgs.bind(this),
        actionPlanSummaryListArgs: this.actionPlanSummaryListArgs.bind(this),
      },
    ]
  }
}
