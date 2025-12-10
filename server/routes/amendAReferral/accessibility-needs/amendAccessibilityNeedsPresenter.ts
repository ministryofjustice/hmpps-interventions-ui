import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import AccessibilityNeedsForm from './amendAccessibilityNeedsForm'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'

export default class AccessibilityNeedsPresenter {
  private formError: FormValidationError | null

  constructor(
    private readonly referral: SentReferral,
    private readonly serviceUser: DeliusServiceUser,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string[]> | null = null,
    readonly showNoChangesBanner: boolean = false
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${referral.id}/details`
    this.formError = error
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly reasonForChangeErrorMessage = PresenterUtils.errorMessage(
    this.error,
    AccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId
  )

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly backLinkUrl: string

  readonly reasonTitle = "What's the reason for changing the mobility, disability or accessibility needs?"

  readonly text = {
    accessibilityNeeds: {
      label: `Change details about ${this.serviceUser.name.forename}'s mobility, disability or accessibility needs`,
      hint: 'For example, if they use a wheelchair, use a hearing aid or have a learning difficulty.',
      errorMessage: this.errorMessageForField('accessibility-needs'),
    },
  }

  readonly fields = {
    accessibilityNeeds: this.utils.stringValue(this.referral.referral.accessibilityNeeds, 'accessibility-needs'),
    reasonForChange: this.utils.stringValue(null, AccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId),
  }
}
