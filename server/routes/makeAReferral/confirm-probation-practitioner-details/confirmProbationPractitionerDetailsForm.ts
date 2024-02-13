import { Request } from 'express'
import { Result, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { DeliusResponsibleOfficer } from '../../../models/delius/deliusResponsibleOfficer'

export default class ConfirmProbationPractitionerDetailsForm {
  private constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>,
    private readonly referral: DraftReferral,
    private readonly deliusResponsibleOfficer: DeliusResponsibleOfficer | null
  ) {}

  static async createForm(
    request: Request,
    referral: DraftReferral,
    deliusResponsibleOfficer: DeliusResponsibleOfficer | null
  ): Promise<ConfirmProbationPractitionerDetailsForm> {
    return new ConfirmProbationPractitionerDetailsForm(
      request,
      await FormUtils.runValidations({ request, validations: [] }),
      referral,
      deliusResponsibleOfficer
    )
  }

  get isValid(): boolean {
    return this.error == null
  }

  public paramsForUpdate(referral: DraftReferral): Partial<DraftReferral> {
    return {
      ndeliusPPName: this.determinePPName(referral.ndeliusPPName),
      ndeliusPPEmailAddress: this.determinePPEmailAddress(referral.ndeliusPPEmailAddress),
      ndeliusPDU: this.determinePPPdu(referral.ndeliusPDU),
      ndeliusPhoneNumber: this.determinePPPhoneNumber(referral.ndeliusPhoneNumber),
      ndeliusTeamPhoneNumber: this.determinePPTeamPhoneNumber(referral.ndeliusTeamPhoneNumber),
    }
  }

  get error(): FormValidationError | null {
    if (this.result.isEmpty()) {
      return null
    }

    return {
      errors: this.result.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }

  private determinePPName(ppName: string | null) {
    const deliusResponsibleOfficerFullName = `${this.deliusResponsibleOfficer?.communityManager?.name.forename} ${this.deliusResponsibleOfficer?.communityManager.name?.surname}`

    if (ppName == null) {
      return deliusResponsibleOfficerFullName
    }
    return deliusResponsibleOfficerFullName === ppName ? deliusResponsibleOfficerFullName : ppName
  }

  private determinePPEmailAddress(ppEmailAddress: string | null) {
    const deliusResponsibleEmailAddress = `${this.deliusResponsibleOfficer?.communityManager.email}`

    if (ppEmailAddress == null) {
      return deliusResponsibleEmailAddress
    }
    return deliusResponsibleEmailAddress === ppEmailAddress ? deliusResponsibleEmailAddress : ppEmailAddress
  }

  private determinePPPhoneNumber(ppPhoneNumber: string | null) {
    const deliusResponsibleTelephoneNumber = this.deliusResponsibleOfficer?.communityManager.telephoneNumber

    if (ppPhoneNumber == null) {
      return deliusResponsibleTelephoneNumber
    }
    return deliusResponsibleTelephoneNumber === ppPhoneNumber ? deliusResponsibleTelephoneNumber : ppPhoneNumber
  }

  private determinePPPdu(ppPdu: string | null): string | undefined {
    const deliusResponsiblePdu = this.deliusResponsibleOfficer?.communityManager.pdu

    if (ppPdu == null) {
      return deliusResponsiblePdu?.description
    }
    return deliusResponsiblePdu?.description === ppPdu ? deliusResponsiblePdu.description : ppPdu
  }

  private determinePPTeamPhoneNumber(ppTeamPhoneNumber: string | null) {
    const deliusResponsibleTeamTelephoneNumber = this.deliusResponsibleOfficer?.communityManager.team.telephoneNumber

    if (ppTeamPhoneNumber == null) {
      return deliusResponsibleTeamTelephoneNumber
    }
    return deliusResponsibleTeamTelephoneNumber === ppTeamPhoneNumber
      ? deliusResponsibleTeamTelephoneNumber
      : ppTeamPhoneNumber
  }
}
