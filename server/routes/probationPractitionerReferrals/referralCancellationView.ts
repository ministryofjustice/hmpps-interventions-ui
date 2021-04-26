import { RadiosArgs, TextareaArgs } from '../../utils/govukFrontendTypes'
import ReferralCancellationPresenter from './referralCancellationPresenter'

export default class ReferralCancellationView {
  constructor(private readonly presenter: ReferralCancellationPresenter) {}

  private get referralCancellationRadiosArgs(): RadiosArgs {
    return {
      fieldset: {
        legend: {
          text: 'What is the reason for the cancellation of this referral?',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m govuk-!-margin-bottom-6',
        },
      },
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
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellation',
      {
        presenter: this.presenter,
        referralCancellationRadiosArgs: this.referralCancellationRadiosArgs,
        additionalCommentsTextareaArgs: this.additionalCommentsTextareaArgs,
      },
    ]
  }
}
