import a from 'indefinite'
import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import WithdrawalReason from '../../../../models/withdrawalReason'
import SentReferral from '../../../../models/sentReferral'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'
import Intervention from '../../../../models/intervention'
import DraftWithdrawalData from '../draftWithdrawalData'
import { Draft } from '../../../../services/draftsService'

export default class ReferralWithdrawalReasonPresenter {
  constructor(
    private readonly draftWithdrawal: Draft<DraftWithdrawalData>,
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
    private readonly serviceUser: DeliusServiceUser,
    private readonly withdrawalReasons: WithdrawalReason[],
    private readonly error: FormValidationError | null = null
  ) {}

  readonly text = {
    title: 'Referral withdrawal',
    information: `You are about to cancel ${this.serviceUser.name.forename} ${
      this.serviceUser.name.surname
    }'s referral for ${a(this.intervention.contractType.name)} intervention with ${
      this.sentReferral.referral.serviceProvider.name
    }.`,
    additionalCommentsLabel: 'Additional comments (optional):',
  }

  get withdrawalReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.withdrawalReasons.map(withdrawalReasons => ({
      value: withdrawalReasons.code,
      text: withdrawalReasons.description,
      checked: this.draftWithdrawal.data.withdrawalReason === withdrawalReasons.code,
    }))
  }

  private readonly utils = new PresenterUtils(null)

  readonly fields = {
    withdrawalComments: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments'),
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'withdrawal-reason')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)
}
