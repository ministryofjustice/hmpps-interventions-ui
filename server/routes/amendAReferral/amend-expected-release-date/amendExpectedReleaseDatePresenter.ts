import SentReferral from '../../../models/sentReferral'
import CalendarDay from '../../../utils/calendarDay'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class AmendExpectedReleaseDatePresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: SentReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${this.referral.id}/details`
  }

  readonly expectedReleaseDateHint = 'For example, 27 5 2024'

  readonly text = {
    title: `Do you know ${this.referral.referral.serviceUser.firstName} ${this.referral.referral.serviceUser.lastName}'s expected release date?`,
    reasonForChangeHeading: 'Enter why the expected release date is not known',
    hint: 'If you add or change the expected release date, you must let the service provider know.',
    reasonForChangeErrorMessage: this.errorMessageForField('amend-date-unknown-reason'),
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['amend-expected-release-date', 'amend-date-unknown-reason'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    expectedReleaseDate: this.utils.dateValue(
      this.referral.referral.expectedReleaseDate === null
        ? null
        : CalendarDay.parseIso8601Date(this.referral.referral.expectedReleaseDate),
      'amend-expected-release-date',
      this.error
    ),
    expectedReleaseDateUnknownReason: this.utils.stringValue(
      this.referral.referral.expectedReleaseDateMissingReason,
      'amend-date-unknown-reason'
    ),
    location: {
      errorMessage: this.errorMessageForField('location'),
    },
  }
}
