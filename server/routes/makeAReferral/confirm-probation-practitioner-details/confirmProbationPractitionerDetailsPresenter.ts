import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import { SummaryListItem } from '../../../utils/summaryList'
import DeliusOfficeLocation from '../../../models/deliusOfficeLocation'
import DeliusDeliveryUnit from '../../../models/deliusDeliveryUnit'
import { DeliusResponsibleOfficer } from '../../../models/delius/deliusResponsibleOfficer'

export default class ConfirmProbationPractitionerDetailsPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: DraftReferral,
    readonly deliusOfficeLocations: DeliusOfficeLocation[],
    readonly deliusDeliveryUnits: DeliusDeliveryUnit[],
    readonly deliusResponsibleOfficer: DeliusResponsibleOfficer | null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/submit-current-location`
  }

  get summary(): SummaryListItem[] {
    const summary: SummaryListItem[] = [
      {
        key: 'Name',
        lines: [
          `${this.deliusResponsibleOfficer?.communityManager.name.forename || ''} ${
            this.deliusResponsibleOfficer?.communityManager.name.surname || ''
          }`.trim() || 'Not found',
        ],
      },
      { key: 'Email address', lines: [this.deliusResponsibleOfficer?.communityManager.email || 'Not found'] },
      {
        key: 'PDU (probation delivery unit)',
        lines: [this.deliusResponsibleOfficer?.communityManager.pdu.description || 'Not found'],
      },
    ]
    return summary
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['probation-practitioner-name'],
  })

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: 'Confirm probation practitioner details',
    description: 'These contact details will be sent to the service provider for the referral. Are they correct?',
    confirmCorrectDetailsFormDescription: 'Enter the correct contact details to be sent to the service provider.',
    confirmDetails: {
      errorMessage: this.errorMessageForField('confirm-details'),
    },
    probationPractitionerName: {
      label: 'Name',
      errorMessage: this.errorMessageForField('probation-practitioner-name'),
    },
    probationPractitionerEmail: {
      label: 'Email address (if known)',
      errorMessage: this.errorMessageForField('probation-practitioner-email'),
    },
    probationPractitionerPduSelect: {
      label: 'PDU (probation delivery input)',
      hint: `Start typing, then choose from the list.`,
      errorMessage: this.errorMessageForField('probation-practitioner-pdu'),
    },
    probationPractitionerOfficeSelect: {
      label: 'Which probation office are they in? (If known)',
      hint: `Start typing, then choose from the list.`,
    },
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    probationPractitionerName: this.utils.stringValue(this.referral.ppName, 'probation-practitioner-name'),
    probationPractitionerEmail: this.utils.stringValue(this.referral.ppEmailAddress, 'probation-practitioner-email'),
    probationPractitionerPdu: this.utils.stringValue(this.referral.ppPdu, 'probation-practitioner-pdu'),
    probationPractitionerOffice: this.utils.stringValue(
      this.referral.ppProbationOffice,
      'probation-practitioner-office'
    ),
  }
}