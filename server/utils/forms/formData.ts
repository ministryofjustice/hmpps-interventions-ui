import { FormValidationError } from '../formValidationError'

export type FormData<ParamsType> =
  | { paramsForUpdate: ParamsType; error: null }
  | { paramsForUpdate: null; error: FormValidationError }
