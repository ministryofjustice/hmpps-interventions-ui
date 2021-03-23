import { DraftReferral } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import { SummaryListItem } from '../../utils/summaryList'
import PresenterUtils from '../../utils/presenterUtils'

export default class NeedsAndRequirementsPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly summary: SummaryListItem[] = [
    { key: 'Needs', lines: ['Accommodation', 'Social inclusion'], isList: true },
    { key: 'Gender', lines: ['Male'], isList: false },
    // TODO IC-746 populate with service user data once we have it
  ]

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: `${this.referral.serviceUser?.firstName}’s needs and requirements`,
    additionalNeedsInformation: {
      label: `Additional information about ${this.referral.serviceUser?.firstName}’s needs (optional)`,
      errorMessage: this.errorMessageForField('additional-needs-information'),
    },
    accessibilityNeeds: {
      label: `Does ${this.referral.serviceUser?.firstName} have any other mobility, disability or accessibility needs? (optional)`,
      hint: 'For example, if they use a wheelchair, use a hearing aid or have a learning difficulty',
      errorMessage: this.errorMessageForField('accessibility-needs'),
    },
    needsInterpreter: {
      label: `Does ${this.referral.serviceUser?.firstName} need an interpreter?`,
      errorMessage: this.errorMessageForField('needs-interpreter'),
    },
    interpreterLanguage: {
      label: 'What language?',
      errorMessage: this.errorMessageForField('interpreter-language'),
    },
    hasAdditionalResponsibilities: {
      label: `Does ${this.referral.serviceUser?.firstName} have caring or employment responsibilities?`,
      hint: 'For example, times and dates when they are at work.',
      errorMessage: this.errorMessageForField('has-additional-responsibilities'),
    },
    whenUnavailable: {
      label: `Provide details of when ${this.referral.serviceUser?.firstName} will not be able to attend sessions`,
      errorMessage: this.errorMessageForField('when-unavailable'),
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
    ],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    additionalNeedsInformation: this.utils.stringValue(
      this.referral.additionalNeedsInformation,
      'additional-needs-information'
    ),
    accessibilityNeeds: this.utils.stringValue(this.referral.accessibilityNeeds, 'accessibility-needs'),
    needsInterpreter: this.utils.booleanValue(this.referral.needsInterpreter, 'needs-interpreter'),
    interpreterLanguage: this.utils.stringValue(this.referral.interpreterLanguage, 'interpreter-language'),
    hasAdditionalResponsibilities: this.utils.booleanValue(
      this.referral.hasAdditionalResponsibilities,
      'has-additional-responsibilities'
    ),
    whenUnavailable: this.utils.stringValue(this.referral.whenUnavailable, 'when-unavailable'),
  }
}
