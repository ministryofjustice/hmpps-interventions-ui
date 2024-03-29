import { RadiosArgs, TextareaArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import ReferralCancellationReasonPresenter from './referralCancellationReasonPresenter'

export default class ReferralCancellationReasonView {
  constructor(private readonly presenter: ReferralCancellationReasonPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get referralCancellationRadiosArgs(): RadiosArgs {
    return {
      fieldset: {
        legend: {
          text: 'What is the reason for the cancellation of this referral?',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m govuk-!-margin-bottom-6',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      name: 'cancellation-reason',
      items: this.presenter.cancellationReasonsFields,
    }
  }

  private get additionalCommentsTextareaArgs(): TextareaArgs {
    return {
      id: 'cancellation-comments',
      name: 'cancellation-comments',
      label: {
        text: this.presenter.text.additionalCommentsLabel,
      },
      value: this.presenter.fields.cancellationComments,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellationReason',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        referralCancellationRadiosArgs: this.referralCancellationRadiosArgs,
        additionalCommentsTextareaArgs: this.additionalCommentsTextareaArgs,
      },
    ]
  }
}
