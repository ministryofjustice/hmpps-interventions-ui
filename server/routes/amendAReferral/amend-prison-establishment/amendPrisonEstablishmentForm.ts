import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { AmendPrisonEstablishmentUpdate } from '../../../models/referralPrisonEstablishment'
import PrisonAndSecuredChildAgency from '../../../models/prisonAndSecureChildAgency'

export default class AmendPrisonEstablishmentForm {
  constructor(
    private readonly request: Request,
    readonly prisonAndSecureChildAgency: PrisonAndSecuredChildAgency[] = [],
    readonly oldPrisonEstablishment: string | null = null
  ) {}

  async data(): Promise<FormData<AmendPrisonEstablishmentUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendPrisonEstablishmentForm.validations,
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        personCustodyPrisonId: this.request.body['amend-prison-establishment'],
        reasonForChange: this.request.body['reason-for-change'],
        oldPrisonEstablishment: this.getPrisonName(this.oldPrisonEstablishment),
        newPrisonEstablishment: this.getPrisonName(this.request.body['amend-prison-establishment']),
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('amend-prison-establishment').notEmpty().withMessage(errorMessages.prisonEstablishment.empty),
      body('reason-for-change').notEmpty().withMessage(errorMessages.prisonEstablishment.emptyReason),
    ]
  }

  private error(validationResult: Result<ValidationError>): FormValidationError | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return {
      errors: validationResult.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }

  private getPrisonName(prisonId: string | null): string {
    return (
      this.prisonAndSecureChildAgency.find(prisonAndSecuredChildAgency => prisonAndSecuredChildAgency.id === prisonId)
        ?.description || ''
    )
  }
}
