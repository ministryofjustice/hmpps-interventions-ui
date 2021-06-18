import * as ExpressValidator from 'express-validator'
import { Request } from 'express'
import { FormValidationResult } from '../formValidationResult'
import FormUtils from '../../formUtils'

export default class ConfirmationCheckboxInput {
  constructor(
    private readonly request: Request,
    private readonly key: string,
    private readonly confirmValue: string,
    private readonly errorMessage: string
  ) {}

  async validate(): Promise<FormValidationResult<boolean>> {
    const validations = [ExpressValidator.body(this.key).contains(this.confirmValue).withMessage(this.errorMessage)]
    const result = await FormUtils.runValidations({ request: this.request, validations })
    const error = FormUtils.validationErrorFromResult(result)
    if (error) {
      return { value: null, error: { errors: [error.errors[0]] } }
    }
    return {
      value: true,
      error: null,
    }
  }
}
