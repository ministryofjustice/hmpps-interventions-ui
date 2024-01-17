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
    this.backLinkUrl = `/referrals/${referral.id}/form`
  }

  get summary(): SummaryListItem[] {
    const summary: SummaryListItem[] = [
      {
        key: 'Name',
        lines: [
          this.referral.ndeliusPPName ||
            `${this.deliusResponsibleOfficer?.communityManager.name.forename || ''} ${
              this.deliusResponsibleOfficer?.communityManager.name.surname || ''
            }`.trim() ||
            'Not found',
        ],
        changeLink: `/referrals/${this.referral.id}/update-probation-practitioner-name`,
      },
      { key: 'Email address', lines: [this.deliusResponsibleOfficer?.communityManager.email || 'Not found'] },
      { key: 'Phone number', lines: [this.deliusResponsibleOfficer?.communityManager.telephoneNumber || 'Not found'] },
      {
        key: 'PDU (Probation Delivery Unit)',
        lines: [this.deliusResponsibleOfficer?.communityManager.pdu.description || 'Not found'],
      },
      {
        key: 'Team Phone number',
        lines: [this.deliusResponsibleOfficer?.communityManager.team.telephoneNumber || 'Not found'],
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
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
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
      label: 'PDU (Probation Delivery Unit)',
      hint: `Start typing then choose from the list.`,
      errorMessage: this.errorMessageForField('probation-practitioner-pdu'),
    },
    probationPractitionerOfficeSelect: {
      label: 'Which probation office are they in? (If known)',
      hint: `Start typing then choose from the list.`,
    },
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    probationPractitionerName: this.utils.stringValue(this.referral.ppName, 'probation-practitioner-name'),
    probationPractitionerEmail: this.utils.stringValue(this.referral.ppEmailAddress, 'probation-practitioner-email'),
    probationPractitionerPdu: this.utils.stringValue(this.referral.ppPdu, 'probation-practitioner-pdu'),
    probationPractitionerTelephoneNumber: this.utils.stringValue(
      this.referral.ndeliusPhoneNumber,
      'probation-practitioner-telephone-number'
    ),
    probationPractitionerTeamTelephoneNumber: this.utils.stringValue(
      this.referral.ndeliusTeamPhoneNumber,
      'probation-practitioner-team-telephone-number'
    ),
    probationPractitionerOffice: this.utils.stringValue(
      this.referral.ppProbationOffice,
      'probation-practitioner-office'
    ),
  }
}
