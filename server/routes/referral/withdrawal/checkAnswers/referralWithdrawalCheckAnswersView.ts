import ReferralWithdrawalCheckAnswersPresenter from './referralWithdrawalCheckAnswersPresenter'

export default class ReferralWithdrawalCheckAnswersView {
  constructor(private readonly presenter: ReferralWithdrawalCheckAnswersPresenter) {}

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
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralWithdrawalCheckAnswers',
      {
        presenter: this.presenter,
        backLinkArgs: this.presenter.backLinkHref,
        confirmWithdrawalButtonArgs: this.confirmWithdrawalButtonArgs,
      },
    ]
  }
}
