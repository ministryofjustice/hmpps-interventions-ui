import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import CalendarDay from '../../../utils/calendarDay'

export default class ExpectedReleaseDatePresenter {
  readonly backLinkUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/submit-current-location`
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly expectedReleaseDateHint = 'For example, 31 3 1980'

  readonly text = {
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    title: `Confirm ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName}'s expected release date`,
    caption: `Do you know ${this.referral.serviceUser?.firstName}'s expected release date?`,
    description: 'You can find this in nDelius and NOMIS',
    releaseDate: {
      label: 'Add the expected release date',
    },
    releaseDateUnknownReason: {
      label: 'Enter why the expected release date is not known',
      errorMessage: this.errorMessageForField('release-date-unknown-reason'),
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['expected-release-date', 'release-date'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly expectedReleaseWarningMessage =
    'When you know the date, you will need to make direct contact with the service provider.'

  readonly fields = {
    hasExpectedReleaseDate: this.knowsExpectedReleaseDate(),
    releaseDate: this.utils.dateValue(
      this.referral.expectedReleaseDate === null
        ? null
        : CalendarDay.parseIso8601Date(this.referral.expectedReleaseDate),
      'release-date',
      this.error
    ),
    releaseDateUnknownReason: this.utils.stringValue(
      this.referral.expectedReleaseDateMissingReason,
      'unknown-release-date-reason'
    ),
  }

  knowsExpectedReleaseDate(): boolean | null {
    if (this.referral.hasExpectedReleaseDate != null) {
      this.utils.booleanValue(this.referral.hasExpectedReleaseDate, 'expected-release-date')
    }
    if (this.referral.expectedReleaseDate != null) {
      return true
    }
    if (this.referral.expectedReleaseDateMissingReason != null) {
      return false
    }
    return null
  }
}
