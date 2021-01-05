import { body, Result, ValidationChain, ValidationError, validationResult } from 'express-validator'
import { Request } from 'express'

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
    await Promise.all(validations.map(validation => validation.run(request)))
    return validationResult(request)
  }
}
