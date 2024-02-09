import DeliusOfficeLocation from '../../../../models/deliusOfficeLocation'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class UpdateProbationPractitionerOfficePresenter {
  backLinkUrl: string

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly ppProbationOffice: string | null | undefined,
    private readonly firstName: string | null = null,
    private readonly lastName: string | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null,
    readonly deliusOfficeLocations: DeliusOfficeLocation[]
  ) {
    this.backLinkUrl = `/referrals/${id}/confirm-probation-practitioner-details`
  }

  readonly text = {
    title: 'Update probation office',
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
    inputHeading: 'Probation office (if known)',
    hint: `Start typing then choose probation office from the list`,
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'delius-probation-practitioner-office')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ppProbationOffice: this.utils.stringValue(this.ppProbationOffice!, 'delius-probation-practitioner-office'),
  }
}
