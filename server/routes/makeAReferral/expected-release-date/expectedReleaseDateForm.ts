import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import CalendarDayInput from '../../../utils/forms/inputs/calendarDayInput'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { FormValidationResult } from '../../../utils/forms/formValidationResult'

export default class ExpectedReleaseDateForm {
  constructor(private readonly request: Request) {}

  static readonly releaseDateUnknownReason = 'release-date-unknown-reason'

  readonly checkFutureDateErrorMessage = 'Enter date in the future'

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const dateInput = new CalendarDayInput(
      this.request,
      'release-date',
      errorMessages.releaseDate,
      null,
      true,
      this.checkFutureDateErrorMessage
    )
    const releaseDateResult = await dateInput.validate()

    const validationResult = await ExpectedReleaseDateForm.validate(this.request)

    if (this.expectedReleaseDate) {
      return releaseDateResult.error
        ? {
            paramsForUpdate: null,
            error: {
              errors: [...(releaseDateResult.error?.errors ?? [])],
            },
          }
        : {
            paramsForUpdate: {
              hasExpectedReleaseDate: this.expectedReleaseDate,
              expectedReleaseDate: this.expectedReleaseDate ? releaseDateResult.value.iso8601 : null,
              expectedReleaseDateMissingReason: !this.expectedReleaseDate
                ? this.request.body['release-date-unknown-reason']
                : null,
            },
            error: null,
          }
    }
    return validationResult!.error
      ? {
          paramsForUpdate: null,
          error: {
            errors: [...(validationResult!.error?.errors ?? [])],
          },
        }
      : {
          paramsForUpdate: {
            hasExpectedReleaseDate: this.expectedReleaseDate,
            expectedReleaseDate: this.expectedReleaseDate ? this.request.body['release-date'] : null,
            expectedReleaseDateMissingReason: !this.expectedReleaseDate
              ? this.request.body['release-date-unknown-reason']
              : null,
          },
          error: null,
        }
  }

  static get validations(): ValidationChain[] {
    return [
      body('release-date-unknown-reason')
        .if(body('expected-release-date').equals('no'))
        .notEmpty()
        .withMessage(errorMessages.releaseDateUnknownReason.empty),
    ]
  }

  static async validate(request: Request): Promise<FormValidationResult<DraftReferral>> {
    const validationResult = await FormUtils.runValidations({
      request,
      validations: ExpectedReleaseDateForm.validations,
    })

    const error = ExpectedReleaseDateForm.error(validationResult)
    if (error) {
      return { value: null, error }
    }
    return {
      value: request.body[ExpectedReleaseDateForm.releaseDateUnknownReason],
      error: null,
    }
  }

  public static error(validationResult: Result<ValidationError>): FormValidationError | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return {
      errors: validationResult.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }

  private get expectedReleaseDate(): boolean {
    return this.request.body['expected-release-date'] === 'yes'
  }
}
