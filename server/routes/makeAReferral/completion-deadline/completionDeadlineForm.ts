import { Request } from 'express'
import * as ExpressValidator from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import CalendarDayInput from '../../../utils/forms/inputs/calendarDayInput'
import { FormData } from '../../../utils/forms/formData'
import { CompletionDeadlineFormUpdate } from './completionDeadlineFormUpdate'
import { FormValidationError } from '../../../utils/formValidationError'
import FormUtils from '../../../utils/formUtils'
import { FormValidationResult } from '../../../utils/forms/formValidationResult'

export default class CompletionDeadlineForm {
  constructor(
    private readonly request: Request,
    private readonly isSentReferral: boolean
  ) {}

  static readonly completionDeadlineFieldId = 'completion-deadline'

  static readonly reasonForChangeFieldId = 'reason-for-change'

  async data(): Promise<FormData<CompletionDeadlineFormUpdate>> {
    const dateInput = new CalendarDayInput(this.request, 'completion-deadline', errorMessages.completionDeadline)
    const completionDeadlineResult = await dateInput.validate()

    if (this.isSentReferral) {
      const reasonForChangeResult = await CompletionDeadlineForm.validate(this.request)

      return completionDeadlineResult.error || reasonForChangeResult!.error
        ? {
            paramsForUpdate: null,
            error: {
              errors: [
                ...(completionDeadlineResult.error?.errors ?? []),
                ...(reasonForChangeResult!.error?.errors ?? []),
              ],
            },
          }
        : {
            error: null,
            paramsForUpdate: {
              completionDeadline: completionDeadlineResult.value.iso8601,
              reasonForChange: reasonForChangeResult.value,
            },
          }
    }
    return completionDeadlineResult.value
      ? {
          error: null,
          paramsForUpdate: {
            completionDeadline: completionDeadlineResult.value.iso8601,
            reasonForChange: null,
          },
        }
      : { error: completionDeadlineResult.error, paramsForUpdate: null }
  }

  static get validations() {
    return [
      ExpressValidator.body(CompletionDeadlineForm.reasonForChangeFieldId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.reasonForChange.cannotBeEmpty),
    ]
  }

  static async validate(request: Request): Promise<FormValidationResult<string>> {
    const validationResult = await FormUtils.runValidations({
      request,
      validations: CompletionDeadlineForm.validations,
    })

    const error = CompletionDeadlineForm.extractErrors(validationResult)
    if (error) {
      return { value: null, error }
    }
    return {
      value: request.body[CompletionDeadlineForm.reasonForChangeFieldId],
      error: null,
    }
  }

  private static extractErrors(result: ExpressValidator.Result): FormValidationError | null {
    const formValidationError = FormUtils.validationErrorFromResult(result)
    if (formValidationError !== null) {
      return formValidationError
    }
    return null
  }
}
