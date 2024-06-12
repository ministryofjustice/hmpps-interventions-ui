import ReferralWithdrawalCheckAnswersPresenter from './referralWithdrawalCheckAnswersPresenter'
import ViewUtils from '../../../../utils/viewUtils'

export default class ReferralWithdrawalCheckAnswersView {
  constructor(private readonly presenter: ReferralWithdrawalCheckAnswersPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get confirmWithdrawalButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'confirm-withdrawal',
      name: 'confirm-withdrawal',
      attributes: { 'data-cy': 'confirm-withdrawal' },
      fieldset: {
        legend: {
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      items: [
        {
          id: 'confirmWithdrawalYesRadio',
          value: 'yes',
          text: 'Yes',
        },
        {
          id: 'confirmWithdrawalNoRadio',
          value: 'no',
          text: 'No',
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralWithdrawalCheckAnswers',
      {
        presenter: this.presenter,
        backLinkArgs: this.presenter.backLinkHref,
        confirmWithdrawalButtonArgs: this.confirmWithdrawalButtonArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}
