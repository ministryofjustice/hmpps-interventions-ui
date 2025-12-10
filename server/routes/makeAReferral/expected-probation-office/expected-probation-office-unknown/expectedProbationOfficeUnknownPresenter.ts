import DraftReferral from '../../../../models/draftReferral'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class ExpectedProbationOfficeUnknownPresenter {
  readonly backLinkUrl: string

  private formError: FormValidationError | null

  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/expected-probation-office`
    this.formError = error
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    title: 'Enter why the expected probation office is not known',
    probationOfficeUnknownReason: {
      errorMessage: this.errorMessageForField('probation-office-unknown-reason'),
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['probation-office-unknown-reason'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    probationOfficeUnknownReason: this.utils.stringValue(
      this.referral.expectedProbationOfficeUnKnownReason,
      'probation-office-unknown-reason'
    ),
  }
}
