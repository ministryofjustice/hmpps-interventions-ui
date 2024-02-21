import DeliusDeliveryUnit from '../../../../models/deliusDeliveryUnit'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class UpdateProbationPractitionerPduPresenter {
  backLinkUrl: string

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly ndeliusPdu: string | null | undefined,
    private readonly firstName: string | null = null,
    private readonly lastName: string | null = null,
    private readonly amendPPDetails: boolean = false,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null,
    readonly deliusDeliveryUnits: DeliusDeliveryUnit[]
  ) {
    this.backLinkUrl = amendPPDetails
      ? `/referrals/${id}/check-all-referral-information`
      : `/referrals/${id}/confirm-probation-practitioner-details`
  }

  readonly text = {
    title: 'Update PDU (Probation Delivery Unit)',
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
    inputHeading: 'PDU (Probation Delivery Unit)',
    hint: `Start typing then choose PDU from the list`,
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'delius-probation-practitioner-pdu')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ndeliusPdu: this.utils.stringValue(this.ndeliusPdu!, 'delius-probation-practitioner-pdu'),
  }
}
