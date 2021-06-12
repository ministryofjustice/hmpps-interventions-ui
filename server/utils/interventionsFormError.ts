import createError from 'http-errors'
import { InterventionsServiceValidationError } from '../services/interventionsService'
import interventionsServiceErrorMessages from './interventionsServiceErrorMessages'
import { FormValidationError } from './formValidationError'

const dateFormFields = ['completion-deadline']

// This re-throws the error if `err` is not an interventions service validation error.
export default function createFormValidationErrorOrRethrow(err: Error): FormValidationError {
  if (createError.isHttpError(err)) {
    if (err.response?.body?.validationErrors) {
      const validationErrors = err.response.body.validationErrors as InterventionsServiceValidationError[]
      return {
        errors: validationErrors.map(it => {
          return {
            formFields: formFieldsForServiceField(it.field),
            errorSummaryLinkedField: errorSummaryLinkedFieldForServiceField(it.field),
            message: messageForServiceValidationError(it),
          }
        }),
      }
    }
  }

  throw err
}

function kebabCaseFromLowerCamelCase(val: string): string {
  return val.replace(/[A-Z]/g, substring => `-${substring.toLowerCase()}`)
}

function formFieldsForServiceField(serviceField: string): string[] {
  const formField = kebabCaseFromLowerCamelCase(serviceField)

  if (isDateField(formField)) {
    return [`${formField}-day`, `${formField}-month`, `${formField}-year`]
  }

  return [formField]
}

function errorSummaryLinkedFieldForServiceField(serviceField: string) {
  const formField = kebabCaseFromLowerCamelCase(serviceField)

  if (isDateField(formField)) {
    return `${formField}-day`
  }

  return formField
}

function isDateField(formField: string): boolean {
  return dateFormFields.includes(formField)
}

function messageForServiceValidationError(error: InterventionsServiceValidationError): string {
  if (
    error.field in interventionsServiceErrorMessages &&
    error.error in interventionsServiceErrorMessages[error.field]
  ) {
    return interventionsServiceErrorMessages[error.field][error.error]
  }

  return error.error
}
