export default class ReferralWithdrawalCheckAnswersPresenter {
  constructor(
    private readonly referralId: string,
    private readonly draftWithdrawalId: string
  ) {}

  readonly text = {
    title: 'Referral Withdrawal',
    confirmationQuestion: 'Are you sure you want to cancel this referral?',
  }

  readonly confirmWithdrawalHref = `/probation-practitioner/referrals/${this.referralId}/withdrawal/${this.draftWithdrawalId}/submit`
}
