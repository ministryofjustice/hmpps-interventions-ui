import * as ExpressValidator from 'express-validator'
import { Request } from 'express'
import ClockTime from '../../clockTime'
import { FormValidationError } from '../../formValidationError'
import { FormValidationResult } from '../formValidationResult'
import FormUtils from '../../formUtils'

export interface TwelveHourClockTimeErrorMessages {
  hourEmpty: string
  minuteEmpty: string
  partOfDayEmpty: string
  invalidTime: string
}

export default class TwelveHourClockTimeInput {
  constructor(
    private readonly request: Request,
    private readonly key: string,
    private readonly errorMessages: TwelveHourClockTimeErrorMessages
  ) {}

  private get keys() {
    return { hour: `${this.key}-hour`, minute: `${this.key}-minute`, partOfDay: `${this.key}-part-of-day` }
  }

  async validate(): Promise<FormValidationResult<ClockTime>> {
    const result = await FormUtils.runValidations({ request: this.request, validations: this.validations })

    const error = this.error(result)
    if (error) {
      return { value: null, error }
    }

    return {
      value: this.clockTime!,
      error: null,
    }
  }

  private error(result: ExpressValidator.Result): FormValidationError | null {
    const error = FormUtils.validationErrorFromResult(result)
    if (error !== null) {
      return this.convertToSingleError(error)
    }

    if (this.clockTime === null) {
      return {
        errors: [
          {
            errorSummaryLinkedField: this.keys.hour,
            formFields: [this.keys.hour, this.keys.minute, this.keys.partOfDay],
            message: this.errorMessages.invalidTime,
          },
        ],
      }
    }

    return null
  }

  private convertToSingleError(error: FormValidationError): FormValidationError {
    return { errors: [error.errors[0]] }
  }

  private get validations() {
    // TODO (IC-1503) Make sure we’re conforming to all GOV.UK Design System
    // guidance for error messages
    return [
      ExpressValidator.body(this.keys.hour)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.hourEmpty)
        .bail()
        .isInt()
        .withMessage(this.errorMessages.invalidTime),
      ExpressValidator.body(this.keys.minute)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.minuteEmpty)
        .bail()
        .isInt()
        .withMessage(this.errorMessages.invalidTime),
      ExpressValidator.body(this.keys.partOfDay)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.partOfDayEmpty)
        .bail()
        .isIn(['am', 'pm'])
        .withMessage(this.errorMessages.invalidTime),
    ]
  }

  private get clockTime(): ClockTime | null {
    return ClockTime.fromTwelveHourComponents(
      Number(this.request.body[this.keys.hour]),
      Number(this.request.body[this.keys.minute]),
      0,
      this.request.body[this.keys.partOfDay] as 'am' | 'pm'
    )
  }
}
