import { Request } from 'express'
import { body, Result, SanitizationChain, ValidationError, validationResult } from 'express-validator'
import { DraftReferral } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import errorMessages from '../../utils/errorMessages'

export default class CompletionDeadlineForm {
  private constructor(private readonly request: Request, private readonly result: Result<ValidationError>) {
    this.result = validationResult(request)
  }

  static async createForm(request: Request): Promise<CompletionDeadlineForm> {
    await Promise.all(this.validations.map(validation => validation.run(request)))

    const result = validationResult(request)

    return new CompletionDeadlineForm(request, result)
  }

  static get validations(): SanitizationChain[] {
    return [
      // TODO decide whether we like the fact that express-validator is mutating the request?
      // e.g. the `bail` before toInt() is so that we don’t end up replaying NaN back to the user
      // if they enter a blank input
      body('completion-deadline-day')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.completionDeadline.dayEmpty)
        .isInt()
        .withMessage(errorMessages.completionDeadline.invalidDate)
        .bail()
        .toInt(),
      body('completion-deadline-month')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.completionDeadline.monthEmpty)
        .isInt()
        .withMessage(errorMessages.completionDeadline.invalidDate)
        .bail()
        .toInt(),
      body('completion-deadline-year')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.completionDeadline.yearEmpty)
        .isInt()
        .withMessage(errorMessages.completionDeadline.invalidDate)
        .bail()
        .toInt(),
    ]
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    if (this.completionDeadline === null) {
      return {}
    }

    return {
      completionDeadline: this.completionDeadline.iso8601,
    }
  }

  get isValid(): boolean {
    return this.errors === null
  }

  get errors(): CompletionDeadlineErrors | null {
    if (this.result.isEmpty() && this.completionDeadline) {
      return null
    }

    // TODO (IC-706) use `result`, implement all the rules of the GOV.UK Design
    // System date input component error handling
    return {
      firstErroredField: 'day',
      erroredFields: ['day', 'month', 'year'],
      message: errorMessages.completionDeadline.invalidDate,
    }
  }

  private get completionDeadline(): CalendarDay | null {
    return CalendarDay.fromComponents(
      this.request.body['completion-deadline-day'],
      this.request.body['completion-deadline-month'],
      this.request.body['completion-deadline-year']
    )
  }
}

// This interface is up for debate
export interface CompletionDeadlineErrors {
  firstErroredField: 'day' | 'month' | 'year'
  erroredFields: ('day' | 'month' | 'year')[]
  message: string
}
