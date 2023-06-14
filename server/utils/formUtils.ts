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

  static getFormValidationError( result: Result<ValidationError>): FormValidationError{
    let summaryError:FormValidationError = {errors: []}
    let errors = result.array()
    errors.forEach(function (value) {
      summaryError.errors.push(FormUtils.errorSummary(value))
    })
    return summaryError
  }

  static errorSummary(validationError: ValidationError) {
    switch (validationError.type){
      case 'field':
        return{
          formFields: [validationError.path],
          errorSummaryLinkedField: validationError.path,
          message: validationError.msg
        }
        // case 'alternative':
        //   return validationError.nestedErrors.map(error => ({
        //     formFields: [error.path],
        //     errorSummaryLinkedField: error.path,
        //     message: error.msg
        //   })
        //   )
        //       return null
        // case 'alternative_grouped':
        //   // validationError.nestedErrors.map(error => ({
        //   //   formFields: [error.],
        //   //   errorSummaryLinkedField: error.path,
        //   //   message: error.msg
        //   // })
        //   // return{
        //   //   formFields: [validationError],
        //   //   errorSummaryLinkedField: validationError.path,
        //   //   message: validationError.msg
        //   // }
        //   // this is an AlternativeValidationError or GroupedAlternativeValidationError
        //       return null
        // case 'unknown_fields':
        //   // this is an UnknownFieldValidationError
        //   const fields = validationError.fields.map(field => field.path).join(', ');
        //   return null

      default:
        // Not a known type.
        throw new Error(`Not a known express-validator error: ${validationError}`);
    }
  }
}
