import { Request } from 'express'
import DraftReferral from '../../../models/draftReferral'
import errorMessages from '../../../utils/errorMessages'
import CalendarDayInput from '../../../utils/forms/inputs/calendarDayInput'
import { FormData } from '../../../utils/forms/formData'
import { ReferralUpdate } from '../../../models/referralUpdate'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import { FormValidationError } from '../../../utils/formValidationError'
import FormUtils from '../../../utils/formUtils'
import * as ExpressValidator from 'express-validator'
import { err } from 'pino-std-serializers'
import { forEach } from 'iterall'

export default class CompletionDeadlineForm {
  constructor(private readonly request: Request, private readonly isSentReferral: boolean) {}

  static readonly completionDeadlineFieldId = 'completion-deadline'

  static readonly reasonForChangeFieldId = 'reason-for-change'

  async data(): Promise<FormData<ReferralUpdate>> {
    const input = new CalendarDayInput(this.request, 'completion-deadline', errorMessages.completionDeadline)
    const completionDeadlineResult = await input.validate()
    let reasonForChangeResult: Result | null = null

    if (this.isSentReferral) {
      reasonForChangeResult = await FormUtils.runValidations({
        request: this.request,
        validations: CompletionDeadlineForm.validations,
      })
      // return { error: errors, paramsForUpdate: null }
    }

    if (completionDeadlineResult.value && reasonForChangeResult != null && !reasonForChangeResult.isEmpty) {
      return {
        error: null,
        paramsForUpdate: {
          draftReferral: { completionDeadline: completionDeadlineResult.value.iso8601 },
          reasonForUpdate: this.request.body[CompletionDeadlineForm.reasonForChangeFieldId],
        },
      }
    } else {
      // if(reasonForChangeResult != null){
      //   const errors = new FormValidationError({errors: completionDeadlineResult.error?.errors.concat(FormUtils.validationErrorFromResult(reasonForChangeResult)?.errors || [])})
      // }
      const error1 = FormUtils.validationErrorFromResult(reasonForChangeResult!!)

      // const errors1 = [completionDeadlineResult.error?.errors, FormUtils.validationErrorFromResult(reasonForChangeResult)?.errors || [])]
      // let abc: { add: (arg0: { formFields: string[]; errorSummaryLinkedField: string; message: string }) => void } =
      // completionDeadlineResult.error!!.errors.forEach(aaaa => abc.add(aaaa))
      // error1?.errors.forEach(bbbb => abc.add(bbbb))

      //
      return {
        error: reasonForChangeResult
          ? {
              errors: completionDeadlineResult.error?.errors.concat(
                FormUtils.validationErrorFromResult(reasonForChangeResult)?.errors || []
              ),
            }
          : completionDeadlineResult.error,
        paramsForUpdate: null,
      }

      // return {
      //   error: reasonForChangeResult
      //       ? abc
      //       : completionDeadlineResult.error,
      //   paramsForUpdate: null
      // }

      // return { error: completionDeadlineResult.error.errors concat(FormUtils.validationErrorFromResult(reasonForChangeResult) || []), paramsForUpdate: null }
    }
  }
  static get validations() {
    return [
      ExpressValidator.body(CompletionDeadlineForm.reasonForChangeFieldId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage('something went wrong'),
    ]
  }
}
