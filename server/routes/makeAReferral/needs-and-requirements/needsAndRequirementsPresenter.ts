import DraftReferral from '../../../models/draftReferral'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class NeedsAndRequirementsPresenter {
  constructor(
    private readonly referral: DraftReferral | null = null,
    readonly sentReferral: SentReferral | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly backLink: string = `/probation-practitioner/referrals/${this.sentReferral?.id}/details`

  readonly text = {
    title: this.referral
      ? `${this.referral?.serviceUser?.firstName}’s needs and requirements`
      : 'Do you want to change the needs and requirements? (optional)',
    additionalNeedsInformation: {
      label: `Additional information about ${
        this.referral ? this.referral?.serviceUser?.firstName : this.sentReferral?.referral.serviceUser.firstName
      }’s needs (optional)`,
      errorMessage: this.errorMessageForField('additional-needs-information'),
    },
    accessibilityNeeds: {
      label: `Does ${
        this.referral ? this.referral?.serviceUser?.firstName : this.sentReferral?.referral.serviceUser.firstName
      } have any other mobility, disability or accessibility needs? (optional)`,
      hint: 'For example, if they use a wheelchair, use a hearing aid or have a learning difficulty.',
      value: this.sentReferral?.referral.accessibilityNeeds,
      errorMessage: this.errorMessageForField('accessibility-needs'),
    },
    needsInterpreter: {
      label: `Does ${
        this.referral ? this.referral?.serviceUser?.firstName : this.sentReferral?.referral.serviceUser.firstName
      } need an interpreter?`,
      errorMessage: this.errorMessageForField('needs-interpreter'),
    },
    interpreterLanguage: {
      label: 'What language?',
      errorMessage: this.errorMessageForField('interpreter-language'),
    },
    hasAdditionalResponsibilities: {
      label: `Does ${
        this.referral ? this.referral?.serviceUser?.firstName : this.sentReferral?.referral.serviceUser.firstName
      } have caring or employment responsibilities?`,
      hint: 'For example, times and dates when they are at work.',
      errorMessage: this.errorMessageForField('has-additional-responsibilities'),
    },
    whenUnavailable: {
      label: `Provide details of when ${
        this.referral ? this.referral?.serviceUser?.firstName : this.sentReferral?.referral.serviceUser.firstName
      } will not be able to attend sessions`,
      errorMessage: this.errorMessageForField('when-unavailable'),
    },
    reasonForChange: {
      errorMessage: this.errorMessageForField('reason-for-change'),
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: [
      'additional-needs-information',
      'accessibility-needs',
      'needs-interpreter',
      'interpreter-language',
      'has-additional-responsibilities',
      'when-unavailable',
      'reason-for-change',
    ],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    additionalNeedsInformation: this.utils.stringValue(
      this.referral?.additionalNeedsInformation ?? this.sentReferral?.referral.additionalNeedsInformation ?? '',
      'additional-needs-information'
    ),
    accessibilityNeeds: this.utils.stringValue(
      this.referral?.accessibilityNeeds ?? this.sentReferral?.referral.accessibilityNeeds ?? '',
      'accessibility-needs'
    ),
    needsInterpreter: this.utils.booleanValue(this.referral?.needsInterpreter ?? false, 'needs-interpreter'),
    interpreterLanguage: this.utils.stringValue(
      this.referral?.interpreterLanguage ?? this.sentReferral?.referral.interpreterLanguage ?? '',
      'interpreter-language'
    ),
    hasAdditionalResponsibilities: this.utils.booleanValue(
      this.referral?.hasAdditionalResponsibilities ?? false,
      'has-additional-responsibilities'
    ),
    whenUnavailable: this.utils.stringValue(
      this.referral?.whenUnavailable ?? this.sentReferral?.referral.whenUnavailable ?? '',
      'when-unavailable'
    ),
    reasonForChange: this.utils.stringValue(
      this.referral?.reasonForChange ?? this.sentReferral?.referral.reasonForChange ?? '',
      'reason-for-change'
    ),
  }
}
