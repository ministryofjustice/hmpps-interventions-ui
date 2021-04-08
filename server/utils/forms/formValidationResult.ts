import { FormValidationError } from '../formValidationError'

interface FormValidationErrorResult {
  value: null
  error: FormValidationError
}

interface FormValidationSuccessResult<Value> {
  value: Value
  error: null
}

export type FormValidationResult<Value> = FormValidationErrorResult | FormValidationSuccessResult<Value>
