import { Request } from 'express'
import errorMessages from '../../../utils/errorMessages'
import CalendarDayInput from '../../../utils/forms/inputs/calendarDayInput'
import { FormData } from '../../../utils/forms/formData'
import { ReferralUpdate } from '../../../models/referralUpdate'
import { FormValidationError } from '../../../utils/formValidationError'
import FormUtils from '../../../utils/formUtils'
import * as ExpressValidator from 'express-validator'
import {FormValidationResult} from "../../../utils/forms/formValidationResult";

export default class CompletionDeadlineForm {
  constructor(private readonly request: Request, private readonly isSentReferral: boolean) {}

  static readonly completionDeadlineFieldId = 'completion-deadline'

  static readonly reasonForChangeFieldId = 'reason-for-change'

  async data(): Promise<FormData<ReferralUpdate>> {
    const input = new CalendarDayInput(this.request, 'completion-deadline', errorMessages.completionDeadline)
    const completionDeadlineResult = await input.validate()
    let reasonForChangeResult: FormValidationResult<string> | null = null
    if (this.isSentReferral) {
      reasonForChangeResult = await CompletionDeadlineForm.validate(this.request)
      if (
          completionDeadlineResult.error ||
          reasonForChangeResult!.error
      ) {
        return {
          paramsForUpdate: null,
          error: {
            errors: [
              ...(completionDeadlineResult.error?.errors ?? []),
              ...(reasonForChangeResult!.error?.errors ?? []),
            ],
          },
        }
      } else{
        return {
          error: null,
          paramsForUpdate: {
            draftReferral: { completionDeadline: completionDeadlineResult.value.iso8601 },
            reasonForUpdate: this.request.body[CompletionDeadlineForm.reasonForChangeFieldId],
          },
        }
      }
    } else{
      if (completionDeadlineResult.value) {
        return { error: null, paramsForUpdate: { draftReferral : {completionDeadline: completionDeadlineResult.value.iso8601 }, reasonForUpdate: null } }
      }
      return { error: completionDeadlineResult.error, paramsForUpdate: null }
    }
  }


  static get validations() {
    return [
      ExpressValidator.body(CompletionDeadlineForm.reasonForChangeFieldId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.completionDeadline.cannotBeEmpty),
    ]
  }

  static async validate(request: Request) :Promise<FormValidationResult<string>>{
    const validationResult = await FormUtils.runValidations({
      request: request,
      validations: CompletionDeadlineForm.validations,
    })

    const error = CompletionDeadlineForm.extractErrors(validationResult)
    if (error) {
      return { value: null, error }
    }
    return {
      value: CompletionDeadlineForm.reasonForChangeFieldId,
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
