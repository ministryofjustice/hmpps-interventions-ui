import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import CalendarDay from '../../../utils/calendarDay'

export default class ChangeExpectedReleaseDatePresenter {
  readonly backLinkUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/expected-release-date`
  }

  readonly expectedReleaseDateHint = 'For example, 31 3 1980'

  readonly text = {
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    title: `Enter ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName}'s expected release date`,
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['release-date'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    releaseDate: this.utils.dateValue(
      this.referral.expectedReleaseDate === null
        ? null
        : CalendarDay.parseIso8601Date(this.referral.expectedReleaseDate),
      'release-date',
      this.error
    ),
  }
}
