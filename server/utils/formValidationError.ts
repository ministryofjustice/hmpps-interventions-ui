export interface FormValidationError {
  errors: { formFields: string[]; errorSummaryLinkedField: string; message: string }[]
}
