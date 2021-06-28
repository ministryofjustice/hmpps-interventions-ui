export default class ReferralCancellationCheckAnswersPresenter {
  constructor(private readonly referralId: string, private readonly draftCancellationId: string) {}

  readonly text = {
    title: 'Referral Cancellation',
    confirmationQuestion: 'Are you sure you want to cancel this referral?',
  }

  readonly confirmCancellationHref = `/probation-practitioner/referrals/${this.referralId}/cancellation/${this.draftCancellationId}/submit`
}
