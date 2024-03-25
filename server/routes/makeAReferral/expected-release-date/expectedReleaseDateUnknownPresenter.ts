import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ExpectedReleaseDateUnknownPresenter {
  readonly backLinkUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/expected-release-date`
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly expectedReleaseWarningMessage =
    'When you know the date, you will need to make direct contact with the service provider.'

  readonly text = {
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    title: 'Enter why the expected release date is not known',
    releaseDateUnknownReason: {
      errorMessage: this.errorMessageForField('release-date-unknown-reason'),
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['release-date-unknown-reason'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    releaseDateUnknownReason: this.utils.stringValue(
      this.referral.expectedReleaseDateMissingReason,
      'unknown-release-date-reason'
    ),
  }
}
