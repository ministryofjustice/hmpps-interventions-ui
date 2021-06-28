import { Request } from 'express'
import { ValidationChain, body, Result, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import errorMessages from '../../../utils/errorMessages'
import { FormValidationError } from '../../../utils/formValidationError'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'

export default class UpdateServiceCategoriesForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: UpdateServiceCategoriesForm.validations,
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
        serviceCategoryIds: this.request.body['service-category-ids'],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('service-category-ids').notEmpty().withMessage(errorMessages.serviceCategories.empty)]
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
}
