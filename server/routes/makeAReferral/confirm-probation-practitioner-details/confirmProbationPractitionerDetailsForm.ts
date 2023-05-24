import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import FormUtils from '../../../utils/formUtils'
import errorMessages from '../../../utils/errorMessages'
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
      await FormUtils.runValidations({ request, validations: this.validations() }),
      referral,
      deliusResponsibleOfficer
    )
  }

  static validations(): ValidationChain[] {
    return [
      body('confirm-details')
        .isIn(['yes', 'no'])
        .withMessage(errorMessages.confirmProbationPractitionerDetails.emptyRadio),
      body('probation-practitioner-name')
        .if(body('confirm-details').equals('no'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.confirmProbationPractitionerDetails.emptyName),
      body('probation-practitioner-email')
        .if(body('probation-practitioner-email').notEmpty({ ignore_whitespace: true }))
        .isEmail()
        .withMessage(errorMessages.confirmProbationPractitionerDetails.invalidEmail),
      body('probation-practitioner-pdu')
        .if(body('confirm-details').equals('no'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.confirmProbationPractitionerDetails.emptyPdu),
    ]
  }

  get isValid(): boolean {
    return this.error == null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      ndeliusPPName: `${this.deliusResponsibleOfficer?.communityManager?.name.forename} ${this.deliusResponsibleOfficer?.communityManager.name?.surname}`,
      ndeliusPPEmailAddress: `${this.deliusResponsibleOfficer?.communityManager.email}`,
      ndeliusPDU: `${this.deliusResponsibleOfficer?.communityManager.pdu.description}`,
      ppName: this.request.body['probation-practitioner-name'],
      ppEmailAddress: this.request.body['probation-practitioner-email'],
      ppProbationOffice: this.request.body['probation-practitioner-office'],
      ppPdu: this.request.body['probation-practitioner-pdu'],
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
