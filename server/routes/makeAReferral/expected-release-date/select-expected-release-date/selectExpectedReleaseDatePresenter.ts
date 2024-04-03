import moment from 'moment-timezone'
import DraftReferral from '../../../../models/draftReferral'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class SelectExpectedReleaseDatePresenter {
  readonly backLinkUrl: string

  readonly releaseDateUnknownUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly amendPPDetails: boolean,
    private readonly releaseDate: string | null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/submit-current-location`
    this.releaseDateUnknownUrl = `/referrals/${referral.id}/expected-release-date-unknown${
      this.amendPPDetails ? '?amendPPDetails=true' : ''
    }`
  }

  readonly submitHref = `/referrals/${this.referral.id}/select-expected-release-date/submit${
    this.amendPPDetails ? '?amendPPDetails=true' : ''
  }`

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly expectedReleaseDateHint = 'For example, 27 3 2023'

  readonly text = {
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    title: `Confirm ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName}'s expected release date`,
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['expected-release-date', 'release-date'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    expectedReleaseDate: {
      errorMessage: this.errorMessageForField('expected-release-date'),
    },
    hasMatchingReleaseDate: this.matchesExpectedReleaseDate(),
    releaseDate: moment(this.releaseDate).format('D MMM YYYY [(]dddd[)]'),
  }

  matchesExpectedReleaseDate(): boolean | null {
    if (
      this.referral.expectedReleaseDateMissingReason != null &&
      this.referral.expectedReleaseDateMissingReason !== ''
    ) {
      return null
    }
    if (this.referral.expectedReleaseDate != null) {
      return this.referral.expectedReleaseDate === this.releaseDate
    }
    return null
  }
}
