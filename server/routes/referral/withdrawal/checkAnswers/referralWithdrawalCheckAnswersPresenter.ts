import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import Intervention from '../../../../models/intervention'

export default class ReferralWithdrawalCheckAnswersPresenter {
  constructor(
    private readonly referralId: string,
    private readonly draftWithdrawalId: string,
    private readonly serviceUser: DeliusServiceUser,
    private readonly intervention: Intervention
  ) {}

  readonly backLinkHref = `/probation-practitioner/referrals/${this.referralId}/withdrawal/${this.draftWithdrawalId}/reason`

  readonly text = {
    title: `Are you sure you want to withdraw ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}'s ${this.intervention.contractType.name} referral?`,
    confirmationQuestion: `You will not be able to restart or change the referral once it has been closed, you can only add case notes.`,
  }

  readonly confirmWithdrawalHref = `/probation-practitioner/referrals/${this.referralId}/withdrawal/${this.draftWithdrawalId}/submit`
}
