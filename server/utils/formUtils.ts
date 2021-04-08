import { body, Result, ValidationChain, ValidationError, validationResult } from 'express-validator'
import { Request } from 'express'
import { FormValidationError } from './formValidationError'

export default class FormUtils {
  static yesNoRadioWithConditionalInputValidationChain({
    radioName,
    inputName,
    notSelectedErrorMessage,
    inputValidator,
  }: {
    radioName: string
    inputName: string
    notSelectedErrorMessage: string
    inputValidator: (chain: ValidationChain) => ValidationChain
  }): ValidationChain[] {
    return [
      body(radioName).isIn(['yes', 'no']).withMessage(notSelectedErrorMessage),
      inputValidator(body(inputName).if(body(radioName).equals('yes'))),
    ]
  }

  static async runValidations({
    request,
    validations,
  }: {
    request: Request
    validations: ValidationChain[]
  }): Promise<Result<ValidationError>> {
    const clonedRequest = { ...request }
    await Promise.all(validations.map(validation => validation.run(clonedRequest)))
    return validationResult(clonedRequest)
  }

  static validationErrorFromResult(result: Result): FormValidationError | null {
    if (result.isEmpty()) {
      return null
    }

    return {
      errors: result.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }
}
