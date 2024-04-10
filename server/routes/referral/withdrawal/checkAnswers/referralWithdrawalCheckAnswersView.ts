import ReferralWithdrawalCheckAnswersPresenter from './referralWithdrawalCheckAnswersPresenter'

export default class ReferralWithdrawalCheckAnswersView {
  constructor(private readonly presenter: ReferralWithdrawalCheckAnswersPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralWithdrawalCheckAnswers',
      {
        presenter: this.presenter,
      },
    ]
  }
}
