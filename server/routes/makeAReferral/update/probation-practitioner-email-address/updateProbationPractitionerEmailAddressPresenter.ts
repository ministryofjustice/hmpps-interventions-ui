import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class UpdateProbationPractitionerEmailAddressPresenter {
  backLinkUrl: string

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly ppEmailAddress: string | null | undefined,
    private readonly firstName: string | null = null,
    private readonly lastName: string | null = null,
    private readonly amendPPDetails: boolean = false,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.backLinkUrl = amendPPDetails
      ? `/referrals/${id}/check-all-referral-information`
      : `/referrals/${id}/confirm-probation-practitioner-details`
  }

  readonly text = {
    title: 'Update probation practitioner email address',
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
    inputHeading: 'Email address(if known)',
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'delius-probation-practitioner-email-address')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ppEmailAddress: this.utils.stringValue(this.ppEmailAddress!, 'delius-probation-practitioner-email-address'),
  }
}
