import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import SentReferral from '../../../models/sentReferral'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'

export default class AmendEmploymentResponsibilitiesPresenter {
  private readonly utils = new PresenterUtils(this.userInputData)
  private formError: FormValidationError | null

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'abc') // AmendMaximumEnforceableDaysForm.reasonForChangeId)

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly backLinkUrl: string

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceUser: DeliusServiceUser,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null,
    readonly showNoChangesBanner: boolean = false
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${sentReferral.id}/details`
    this.formError = error
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    responsibilities: {
      title: `Do you want to change whether ${this.serviceUser.name.forename} has caring or employment responsibilities?`,
      hasAdditionalResponsibilities: {
        label: `Do you want to change whether ${this.serviceUser.name.forename} has caring or employment responsibilities?`,
        hint: 'For example, times and dates when they are at work.',
        errorMessage: this.errorMessageForField('has-additional-responsibilities'),
      },
      whenUnavailable: {
        label: `Provide details of when ${this.serviceUser.name.forename} will not be able to attend sessions`,
        errorMessage: this.errorMessageForField('when-unavailable'),
      },
    },
    reasonForChange: {
      title: `What's the reason for changing ${this.serviceUser.name.forename}'s caring or employment responsibilities?`,
      hint: `For example, they're now caring for a family member`,
    },
  }

  readonly fields = {
    hasAdditionalResponsibilities: this.utils.booleanValue(
      this.sentReferral.referral.hasAdditionalResponsibilities,
      'has-additional-responsibilities'
    ),
    whenUnavailable: this.utils.stringValue(this.sentReferral.referral.whenUnavailable, 'when-unavailable'),
  }
}
