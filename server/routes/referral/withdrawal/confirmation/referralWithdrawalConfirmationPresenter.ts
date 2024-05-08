import SentReferral from '../../../../models/sentReferral'
import Intervention from '../../../../models/intervention'

export default class ReferralWithdrawalConfirmationPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly dashboardOriginPage?: string
  ) {}

  readonly text = {
    confirmationText: 'Referral withdrawn',
    headingText: 'What happens next.',
    whatHappensNextText: {
      line1: `The referral has been withdrawn. The service provider has been emailed.`,
      line2: `You can view the referral in the cancelled referrals list.`,
    },
  }

  readonly myCasesHref = this.dashboardOriginPage || '/probation-practitioner/dashboard'
}
