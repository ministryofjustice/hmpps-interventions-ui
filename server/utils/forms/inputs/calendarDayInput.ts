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

  private get keys() {
    return { day: `${this.key}-day`, month: `${this.key}-month`, year: `${this.key}-year` }
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

  private error(result: ExpressValidator.Result): FormValidationError | null {
    const isValidDate = this.calendarDay !== null

    if (result.isEmpty() && isValidDate) {
      return null
    }

    // TODO (IC-706) use `result`, implement all the rules of the GOV.UK Design
    // System date input component error handling
    return {
      errors: [
        {
          errorSummaryLinkedField: this.keys.day,
          formFields: [this.keys.day, this.keys.month, this.keys.year],
          message: this.errorMessages.invalidDate,
        },
      ],
    }
  }

  private get validations() {
    // TODO (IC-706) Make sure we’re conforming to all GOV.UK Design System
    // guidance for error messages
    return [
      ExpressValidator.body(this.keys.day)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.dayEmpty)
        .isInt()
        .withMessage(this.errorMessages.invalidDate),
      ExpressValidator.body(this.keys.month)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.monthEmpty)
        .isInt()
        .withMessage(this.errorMessages.invalidDate),
      ExpressValidator.body(this.keys.year)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.yearEmpty)
        .isInt()
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
