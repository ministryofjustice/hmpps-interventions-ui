import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class UpdateProbationPractitionerTeamPhoneNumberPresenter {
  backLinkUrl: string

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly ppTeamPhoneNumber: string | null | undefined,
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
    title: 'Update probation practitioner team phone number',
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
    inputHeading: 'Team phone number(if known)',
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'delius-probation-practitioner-team-phone-number')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ppTeamPhoneNumber: this.utils.stringValue(
      this.ppTeamPhoneNumber!,
      'delius-probation-practitioner-team-phone-number'
    ),
  }
}
