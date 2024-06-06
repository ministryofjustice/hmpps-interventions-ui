import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import Intervention from '../../../../models/intervention'
import { WithdrawalState } from '../../../../models/sentReferral'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class ReferralWithdrawalCheckAnswersPresenter {
  constructor(
    private readonly referralId: string,
    private readonly draftWithdrawalId: string,
    private readonly serviceUser: DeliusServiceUser,
    private readonly intervention: Intervention,
    private readonly withdrawalState: string,
    private readonly error: FormValidationError | null = null,
    readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly backLinkHref = {
    href: `/probation-practitioner/referrals/${this.referralId}/withdrawal/${this.draftWithdrawalId}/reason`,
  }

  readonly text = {
    title:
      this.withdrawalState === WithdrawalState.postICAClosed.toString()
        ? `Are you sure you want to close ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}'s ${this.intervention.contractType.name} referral early?`
        : `Are you sure you want to withdraw ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}'s ${this.intervention.contractType.name} referral?`,
    confirmationQuestion:
      this.withdrawalState === WithdrawalState.postICAClosed.toString()
        ? `You are closing the referral because the intervention has been completed and the outcomes met. You will not be able to restart or change the referral once it has been closed, you can only add case notes.`
        : `You will not be able to restart or change the referral once it has been closed, you can only add case notes.`,
  }

  readonly confirmWithdrawalHref = `/probation-practitioner/referrals/${this.referralId}/withdrawal/${this.draftWithdrawalId}/submit`

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'confirm-withdrawal')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)
}
