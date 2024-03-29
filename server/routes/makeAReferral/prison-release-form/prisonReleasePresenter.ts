import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class PrisonReleasePresenter {
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
    title: `Will ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} be released during the intervention?`,
    description: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    fromPrison: {
      errorMessage: this.errorMessageForField('prison-release'),
      released: `Yes`,
      notReleased: `No - ${this.referral.serviceUser?.firstName} has just arrived in prison and has immediate intervention needs`,
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['prison-release'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    currentLocation: this.utils.booleanValue(this.referral.isReferralReleasingIn12Weeks, 'prison-release'),
  }
}
