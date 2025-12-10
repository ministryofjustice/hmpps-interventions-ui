import DeliusDeliveryUnit from '../../../../models/deliusDeliveryUnit'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class UpdateProbationPractitionerPduPresenter {
  backLinkUrl: string

  private formError: FormValidationError | null

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly ppPdu: string | null | undefined,
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
    this.formError = error
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
    ppPdu: this.utils.stringValue(this.ppPdu!, 'delius-probation-practitioner-pdu'),
  }
}
