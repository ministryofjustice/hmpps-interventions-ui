import { Request } from 'express'
import * as ExpressValidator from 'express-validator'
import { FormValidationResult } from '../formValidationResult'
import { FormValidationError } from '../../formValidationError'
import FormUtils from '../../formUtils'
import { AppointmentDeliveryType } from '../../../models/actionPlan'
import PresenterUtils from '../../presenterUtils'

export interface MeetingMethodErrorMessages {
  empty: string
}

export default class MeetingMethodInput {
  constructor(
    private readonly request: Request,
    private readonly key: string,
    private readonly errorMessages: MeetingMethodErrorMessages
  ) {}

  private readonly utils = new PresenterUtils(this.request.body)

  async validate(): Promise<FormValidationResult<AppointmentDeliveryType>> {
    const validationResult = await FormUtils.runValidations({ request: this.request, validations: this.validations })
    const error = this.extractErrors(validationResult)
    if (error) {
      return { value: null, error }
    }
    return {
      value: this.meetingMethod!,
      error: null,
    }
  }

  private get meetingMethod(): AppointmentDeliveryType | null {
    return this.utils.meetingMethodValue(null, this.key, null).value
  }

  private get validations(): ExpressValidator.ValidationChain[] {
    return [ExpressValidator.body(this.key).notEmpty({ ignore_whitespace: true }).withMessage(this.errorMessages.empty)]
  }

  private extractErrors(result: ExpressValidator.Result): FormValidationError | null {
    const formValidationError = FormUtils.validationErrorFromResult(result)
    if (formValidationError !== null) {
      return formValidationError
    }

    if (this.meetingMethod === null) {
      return {
        errors: [
          {
            errorSummaryLinkedField: this.key,
            formFields: [this.key],
            message: 'Select a meeting method',
          },
        ],
      }
    }

    return null
  }
}
