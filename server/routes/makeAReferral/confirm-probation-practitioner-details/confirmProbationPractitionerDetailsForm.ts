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
    const deliusResponsibleOfficerFullName = `${this.deliusResponsibleOfficer?.communityManager?.name.forename} ${this.deliusResponsibleOfficer?.communityManager.name?.surname}`
    const nDeliusPPName =
      deliusResponsibleOfficerFullName === referral.ndeliusPPName
        ? deliusResponsibleOfficerFullName
        : referral.ndeliusPPName
    return {
      ndeliusPPName: nDeliusPPName,
      ndeliusPPEmailAddress: `${this.deliusResponsibleOfficer?.communityManager.email}`,
      ndeliusPDU: `${this.deliusResponsibleOfficer?.communityManager.pdu.description}`,
      ndeliusPhoneNumber: this.deliusResponsibleOfficer?.communityManager.telephoneNumber,
      ndeliusTeamPhoneNumber: this.deliusResponsibleOfficer?.communityManager.team.telephoneNumber,
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
}
