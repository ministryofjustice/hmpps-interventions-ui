import * as ExpressValidator from 'express-validator'
import { Request } from 'express'
import Duration from '../../duration'
import { FormValidationError } from '../../formValidationError'
import { FormValidationResult } from '../formValidationResult'
import FormUtils from '../../formUtils'

export interface DurationErrorMessages {
  empty: string
  invalidDuration: string
}

export default class DurationInput {
  constructor(
    private readonly request: Request,
    private readonly key: string,
    private readonly errorMessages: DurationErrorMessages
  ) {}

  private get keys() {
    return { hours: `${this.key}-hours`, minutes: `${this.key}-minutes` }
  }

  async validate(): Promise<FormValidationResult<Duration>> {
    const result = await FormUtils.runValidations({ request: this.request, validations: this.validations })

    const error = this.error(result)
    if (error) {
      return { value: null, error }
    }

    return {
      value: this.duration!,
      error: null,
    }
  }

  private error(result: ExpressValidator.Result): FormValidationError | null {
    const formValidationError = FormUtils.validationErrorFromResult(result)
    if (formValidationError !== null) {
      formValidationError.errors = formValidationError.errors.map(anError => {
        if (anError.message === this.errorMessages.empty) {
          // express-validator doesn’t do multi-field validation rules, so
          // we need to mark an empty duration as an error on all fields
          return { ...anError, formFields: Object.values(this.keys) }
        }
        return anError
      })

      return formValidationError
    }

    if (this.duration === null) {
      return {
        errors: [
          {
            errorSummaryLinkedField: this.keys.hours,
            formFields: [this.keys.hours, this.keys.minutes],
            message: this.errorMessages.invalidDuration,
          },
        ],
      }
    }

    return null
  }

  get validations(): ExpressValidator.ValidationChain[] {
    const isEmptyOptions = { ignore_whitespace: true }

    // TODO (IC-1504) Make sure we’re conforming to all GOV.UK Design System
    // guidance for error messages
    return [
      // You need to provide at least one of hours or minutes
      // It's a bit clunky; `oneOf` is what we want but it’s only a middleware
      ExpressValidator.body(this.keys.hours)
        .if(ExpressValidator.body(this.keys.minutes).isEmpty(isEmptyOptions))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.empty),

      // These two express that any provided component must be an integer
      ExpressValidator.body(this.keys.hours)
        .if(ExpressValidator.body(this.keys.hours).notEmpty(isEmptyOptions))
        .isInt()
        .withMessage(this.errorMessages.invalidDuration),
      ExpressValidator.body(this.keys.minutes)
        .if(ExpressValidator.body(this.keys.minutes).notEmpty(isEmptyOptions))
        .isInt()
        .withMessage(this.errorMessages.invalidDuration),
    ]
  }

  get duration(): Duration | null {
    return Duration.fromUnits(
      Number(this.request.body[this.keys.hours]),
      Number(this.request.body[this.keys.minutes]),
      0
    )
  }
}
