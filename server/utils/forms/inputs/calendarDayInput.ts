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
    private readonly errorMessages: CalendarDayErrorMessages,
    private readonly referralDate: string | null = null,
    private readonly checkFutureDate: boolean = false,
    private readonly checkFutureDateErrorMessage: string | null = null,
    private readonly checkExistingDateEarlier: boolean = false,
    private readonly existingDateString: string | null = null
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
        .trim()
        .isInt()
        .withMessage(this.errorMessages.invalidDate),
      ExpressValidator.body(this.keys.month)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.monthEmpty)
        .bail()
        .trim()
        .isInt()
        .withMessage(this.errorMessages.invalidDate),
      ExpressValidator.body(this.keys.year)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.yearEmpty)
        .bail()
        .trim()
        .isInt({
          min: 2000,
          max: 9999,
        }) // sure, dates bigger than this are real dates, but they're not valid here - minimum date protects from submission errors
        .withMessage(this.errorMessages.invalidDate),
      ExpressValidator.body([this.keys.day, this.keys.month, this.keys.year])
        .custom(() => {
          if (this.checkFutureDate) {
            const year = this.request.body[this.keys.year]
            const month = this.request.body[this.keys.month]
            const day = this.request.body[this.keys.day]
            if (
              this.checkIfNotEmptyAndInteger(year) &&
              this.checkIfNotEmptyAndInteger(month) &&
              this.checkIfNotEmptyAndInteger(day)
            ) {
              const enteredDate = new Date(Number(year), Number(month - 1), Number(day))
              const currentDate = new Date()
              currentDate.setHours(0, 0, 0, 0)
              if (enteredDate < currentDate) {
                return false
              }
            }
            return true
          }
          return true
        })
        .withMessage(this.checkFutureDateErrorMessage),
      ExpressValidator.body(this.keys.day).custom(() => {
        const enteredDate = new Date(
          Number(this.request.body[this.keys.year]),
          Number(this.request.body[this.keys.month] - 1),
          Number(this.request.body[this.keys.day]),
          23,
          59,
          59
        )

        if (this.referralDate != null) {
          const maximumDate = new Date()
          maximumDate.setMonth(maximumDate.getMonth() + 6)

          if (enteredDate > maximumDate) {
            const formattedDateMaxDate = maximumDate
              .toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .replace(/ /g, ' ')

            throw new Error(`Date must be no later than ${formattedDateMaxDate}`)
          }
          const dateReferralMade = new Date(this.referralDate)

          if (enteredDate < dateReferralMade) {
            const formattedDateReferralMade = dateReferralMade
              .toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .replace(/ /g, ' ')

            throw new Error(`Date must be no earlier than ${formattedDateReferralMade}`)
          }
        }
        return true
      }),
      ExpressValidator.body(this.keys.day).custom(() => {
        if (
          this.request.body[this.keys.year] === '' ||
          this.request.body[this.keys.month] === '' ||
          this.request.body[this.keys.day] === ''
        ) {
          return true
        }
        const enteredDate = new Date(
          Number(this.request.body[this.keys.year]),
          Number(this.request.body[this.keys.month] - 1),
          Number(this.request.body[this.keys.day]),
          23,
          59,
          59
        )

        if (this.existingDateString != null) {
          const exisitingDate = new Date(this.existingDateString)
          if (enteredDate < exisitingDate) {
            const formattedDateReferralMade = exisitingDate
              .toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .replace(/ /g, ' ')

            throw new Error(`Date must be no earlier than ${formattedDateReferralMade}`)
          }
        }
        return true
      }),
    ]
  }

  private get calendarDay(): CalendarDay | null {
    return CalendarDay.fromComponents(
      Number(this.request.body[this.keys.day]),
      Number(this.request.body[this.keys.month]),
      Number(this.request.body[this.keys.year])
    )
  }

  private checkIfNotEmptyAndInteger(field: string): boolean {
    if (field) {
      const fieldInteger = Number(field)
      return Number.isInteger(fieldInteger)
    }
    return false
  }
}
