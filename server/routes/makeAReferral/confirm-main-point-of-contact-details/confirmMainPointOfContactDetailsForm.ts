import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import FormUtils from '../../../utils/formUtils'
import errorMessages from '../../../utils/errorMessages'
import { FormValidationError } from '../../../utils/formValidationError'
import { DeliusResponsibleOfficer } from '../../../models/delius/deliusResponsibleOfficer'

export default class ConfirmMainPointOfContactDetailsForm {
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
  ): Promise<ConfirmMainPointOfContactDetailsForm> {
    return new ConfirmMainPointOfContactDetailsForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() }),
      referral,
      deliusResponsibleOfficer
    )
  }

  static validations(): ValidationChain[] {
    return [
      body('location')
        .isIn(['establishment', 'probation office'])
        .withMessage(errorMessages.confirmMainPointOfContactDetails.emptyRadio),
      body('probation-practitioner-name')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.confirmMainPointOfContactDetails.emptyName),
      body('probation-practitioner-roleOrJobTitle')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.confirmMainPointOfContactDetails.emptyRoleOrJobTitle),
      body('probation-practitioner-email')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.confirmMainPointOfContactDetails.emptyEmail),
      body('probation-practitioner-email')
        .if(body('probation-practitioner-email').notEmpty({ ignore_whitespace: true }))
        .isEmail()
        .withMessage(errorMessages.confirmMainPointOfContactDetails.invalidEmail),
      body('probation-practitioner-phone-number')
        .if(body('probation-practitioner-phone-number').notEmpty({ ignore_whitespace: true }))
        .isNumeric()
        .withMessage(errorMessages.confirmMainPointOfContactDetails.invalidPhoneNumber),
      body('prison-select')
        .if(body('location').equals('establishment'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.confirmMainPointOfContactDetails.emptyPrisonName),
      body('probation-practitioner-office')
        .if(body('location').equals('probation office'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.confirmMainPointOfContactDetails.emptyProbationOffice),
    ]
  }

  get isValid(): boolean {
    return this.error == null
  }

  private get hasMainPointOfContactDetails(): boolean | null {
    return this.request.body['probation-practitioner-name'] !== null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      ppName: this.request.body['probation-practitioner-name'],
      roleOrJobTitle: this.request.body['probation-practitioner-roleOrJobTitle'],
      ppEmailAddress: this.request.body['probation-practitioner-email'],
      ppPhoneNumber: this.request.body['probation-practitioner-phone-number'],
      ppEstablishment: this.request.body['prison-select'] ? this.request.body['prison-select'] : '',
      ppProbationOffice: this.request.body['probation-practitioner-office']
        ? this.request.body['probation-practitioner-office']
        : '',
      hasMainPointOfContactDetails: this.hasMainPointOfContactDetails,
      ppLocationType: this.request.body.location,
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
