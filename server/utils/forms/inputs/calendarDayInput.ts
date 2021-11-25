import * as ExpressValidator from 'express-validator'
import { Request } from 'express'
import CalendarDay from '../../calendarDay'
import { FormValidationError } from '../../formValidationError'
import { FormValidationResult } from '../formValidationResult'
import FormUtils from '../../formUtils'

export interface CalendarDayErrorMessages {
  dayEmpty: string
  monthEmpty: string
  yearEmpty: string
  invalidDate: string
}

export default class CalendarDayInput {
  constructor(
    private readonly request: Request,
    private readonly key: string,
    private readonly errorMessages: CalendarDayErrorMessages
  ) {}

  private static keys(key: string) {
    return { day: `${key}-day`, month: `${key}-month`, year: `${key}-year` }
  }

  private get keys() {
    return CalendarDayInput.keys(this.key)
  }

  async validate(): Promise<FormValidationResult<CalendarDay>> {
    const result = await FormUtils.runValidations({ request: this.request, validations: this.validations })

    const error = this.error(result)
    if (error) {
      return { value: null, error }
    }

    return {
      value: this.calendarDay!,
      error: null,
    }
  }

  static createError(key: string, message: string): FormValidationError {
    const keys = this.keys(key)

    return {
      errors: [
        {
          errorSummaryLinkedField: keys.day,
          formFields: [keys.day, keys.month, keys.year],
          message,
        },
      ],
    }
  }

  private error(result: ExpressValidator.Result): FormValidationError | null {
    const error = FormUtils.validationErrorFromResult(result)
    if (error !== null) {
      return this.convertToSingleError(error)
    }

    if (this.calendarDay === null) {
      return CalendarDayInput.createError(this.key, this.errorMessages.invalidDate)
    }

    return null
  }

  private convertToSingleError(error: FormValidationError): FormValidationError {
    return { errors: [error.errors[0]] }
  }

  private get validations() {
    // TODO (IC-706) Make sure we’re conforming to all GOV.UK Design System
    // guidance for error messages
    return [
      ExpressValidator.body(this.keys.day)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.dayEmpty)
        .bail()
        .isInt()
        .withMessage(this.errorMessages.invalidDate),
      ExpressValidator.body(this.keys.month)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.monthEmpty)
        .bail()
        .isInt()
        .withMessage(this.errorMessages.invalidDate),
      ExpressValidator.body(this.keys.year)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.yearEmpty)
        .bail()
        .isInt({ max: 9999 }) // sure, dates bigger than this are real dates, but they're not valid here
        .withMessage(this.errorMessages.invalidDate),
    ]
  }

  private get calendarDay(): CalendarDay | null {
    return CalendarDay.fromComponents(
      Number(this.request.body[this.keys.day]),
      Number(this.request.body[this.keys.month]),
      Number(this.request.body[this.keys.year])
    )
  }
}
