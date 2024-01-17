import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class UpdateProbationPractitionerPresenter {
  backLinkUrl: string

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly ndeliusPPName: string | null | undefined,
    private readonly firstName: string | null = null,
    private readonly lastName: string | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.backLinkUrl = `/referrals/${id}/confirm-probation-practitioner-details`
  }

  readonly text = {
    title: 'Update probation practitioner name',
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
    inputHeading: 'Full name',
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'delius-probation-practitioner-name')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ndeliusPPName: this.utils.stringValue(this.ndeliusPPName!, 'delius-probation-practitioner-name'),
  }
}
