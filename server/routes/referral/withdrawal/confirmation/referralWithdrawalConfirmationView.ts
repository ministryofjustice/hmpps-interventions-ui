import ReferralWithdrawalConfirmationPresenter from './referralWithdrawalConfirmationPresenter'

export default class ReferralWithdrawalConfirmationView {
  constructor(private readonly presenter: ReferralWithdrawalConfirmationPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralWithdrawalConfirmation',
      {
        presenter: this.presenter,
      },
    ]
  }
}
