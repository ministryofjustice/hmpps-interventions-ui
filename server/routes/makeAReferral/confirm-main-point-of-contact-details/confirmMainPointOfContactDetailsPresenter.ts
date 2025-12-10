import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import DeliusOfficeLocation from '../../../models/deliusOfficeLocation'
import DeliusDeliveryUnit from '../../../models/deliusDeliveryUnit'
import { DeliusResponsibleOfficer } from '../../../models/delius/deliusResponsibleOfficer'
import PrisonAndSecuredChildAgency from '../../../models/prisonAndSecureChildAgency'

export default class ConfirmMainPointOfContactDetailsPresenter {
  readonly backLinkUrl: string

  private formError: FormValidationError | null

  constructor(
    readonly referral: DraftReferral,
    readonly prisonAndSecureChildAgency: PrisonAndSecuredChildAgency[],
    readonly deliusOfficeLocations: DeliusOfficeLocation[],
    readonly deliusDeliveryUnits: DeliusDeliveryUnit[],
    readonly deliusResponsibleOfficer: DeliusResponsibleOfficer | null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/form`
    this.formError = error
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['probation-practitioner-name'],
  })

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: 'Confirm main point of contact details',
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    description:
      'These details will be sent to the service provider. When a probation practitioner is allocated these details will be replaced.',
    location: {
      errorMessage: this.errorMessageForField('location'),
    },
    probationPractitionerName: {
      label: 'Name',
      errorMessage: this.errorMessageForField('probation-practitioner-name'),
    },
    probationRoleOrJobTitle: {
      label: 'Role / job title',
      errorMessage: this.errorMessageForField('probation-practitioner-roleOrJobTitle'),
    },
    probationPractitionerEmail: {
      label: 'Email address',
      errorMessage: this.errorMessageForField('probation-practitioner-email'),
    },
    probationPractitionerPhoneNumber: {
      label: 'Phone number',
      errorMessage: this.errorMessageForField('probation-practitioner-phone-number'),
    },
    probationPractitionerEstablishmentSelect: {
      label: 'Establishment',
      hint: `Start typing then choose prison name from the list.`,
      errorMessage: this.errorMessageForField('probation-practitioner-pdu'),
    },
    probationPractitionerOfficeSelect: {
      label: 'Probation office',
      hint: `Start typing then choose probation office from the list.`,
      errorMessage: this.errorMessageForField('probation-practitioner-office'),
    },
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    probationPractitionerName: this.utils.stringValue(this.referral.ppName, 'probation-practitioner-name'),
    probationPractitionerEmail: this.utils.stringValue(this.referral.ppEmailAddress, 'probation-practitioner-email'),
    probationPractitionerPhoneNumber: this.utils.stringValue(
      this.referral.ppPhoneNumber,
      'probation-practitioner-phone-number'
    ),
    probationPractitionerRoleOrJobTitle: this.utils.stringValue(
      this.referral.roleOrJobTitle,
      'probation-practitioner-roleOrJobTitle'
    ),
    probationPractitionerEstablishment: this.utils.stringValue(this.referral.ppEstablishment, 'prison-select'),
    probationPractitionerOffice: this.utils.stringValue(
      this.referral.ppProbationOffice,
      'probation-practitioner-office'
    ),
    hasMainPointOfContactDetails: this.utils.booleanValue(this.referral.hasMainPointOfContactDetails, 'location'),
  }
}
