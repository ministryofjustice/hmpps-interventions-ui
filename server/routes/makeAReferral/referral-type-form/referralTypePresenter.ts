import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ReferralTypePresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/community-allocated-form`
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: `What type of referral is this?`,
    description: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    currentLocation: {
      label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} is currently:`,
      errorMessage: this.errorMessageForField('current-location'),
      custodyLabel: `In prison (pre-release)`,
      communityLabel: `In the community`,
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['current-location'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    currentLocation: this.utils.stringValue(this.referral.personCurrentLocationType, 'current-location'),
  }
}
