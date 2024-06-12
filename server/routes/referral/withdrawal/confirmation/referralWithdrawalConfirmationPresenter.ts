import SentReferral from '../../../../models/sentReferral'
import Intervention from '../../../../models/intervention'

export default class ReferralWithdrawalConfirmationPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly dashboardOriginPage?: string
  ) {}

  private readonly assignedToTextAddition = this.referral.assignedTo ? `The service provider has been emailed.` : ''

  readonly text = {
    confirmationText: this.referral.withdrawalCode === 'EAR' ? 'Referral closed early' : 'Referral withdrawn',
    headingText: 'What happens next.',
    whatHappensNextText: {
      line1:
        this.referral.withdrawalCode === 'EAR'
          ? `The referral has been closed. ${this.assignedToTextAddition}`
          : `The referral has been withdrawn. ${this.assignedToTextAddition}`,
      line2:
        this.referral.withdrawalCode === 'EAR'
          ? `You can view the referral in the completed referrals list.`
          : `You can view the referral in the cancelled referrals list.`,
    },
  }

  readonly myCasesHref = this.dashboardOriginPage || '/probation-practitioner/dashboard'
}
