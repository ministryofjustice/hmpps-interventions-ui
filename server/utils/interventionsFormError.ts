import { InterventionsServiceError, InterventionsServiceValidationError } from '../services/interventionsService'
import interventionsServiceErrorMessages from './interventionsServiceErrorMessages'
import { FormValidationError } from './formValidationError'

const dateFormFields = ['completion-deadline']

// This re-throws the error if `interventionsServiceError` is not a validation error.
export default function createFormValidationErrorOrRethrow(
  interventionsServiceError: InterventionsServiceError
): FormValidationError {
  if (interventionsServiceError.validationErrors === undefined) {
    throw interventionsServiceError
  }

  const errors = interventionsServiceError.validationErrors.map(validationError => {
    return {
      formFields: formFieldsForServiceField(validationError.field),
      errorSummaryLinkedField: errorSummaryLinkedFieldForServiceField(validationError.field),
      message: messageForServiceValidationError(validationError),
    }
  })
  return { errors }
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
