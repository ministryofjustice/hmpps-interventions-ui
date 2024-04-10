import { RadiosArgs, TextareaArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import ReferralWithdrawalReasonPresenter from './referralWithdrawlReasonPresenter'

export default class ReferralWithdrawalReasonView {
  constructor(private readonly presenter: ReferralWithdrawalReasonPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get referralWithdrawalRadiosArgs(): RadiosArgs {
    return {
      fieldset: {
        legend: {
          text: 'What is the reason for the withdrawal of this referral?',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m govuk-!-margin-bottom-6',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      name: 'withdrawal-reason',
      items: this.presenter.withdrawalReasonsFields,
    }
  }

  private get additionalCommentsTextareaArgs(): TextareaArgs {
    return {
      id: 'withdrawal-comments',
      name: 'withdrawal-comments',
      label: {
        text: this.presenter.text.additionalCommentsLabel,
      },
      value: this.presenter.fields.withdrawalComments,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralWithdrawalReason',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        referralWithdrawalRadiosArgs: this.referralWithdrawalRadiosArgs,
        additionalCommentsTextareaArgs: this.additionalCommentsTextareaArgs,
      },
    ]
  }
}
