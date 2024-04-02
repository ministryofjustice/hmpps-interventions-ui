import { Request } from 'express'
import { Result, ValidationError } from 'express-validator'
import DraftReferral from '../../../../models/draftReferral'
import CalendarDayInput from '../../../../utils/forms/inputs/calendarDayInput'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class ChangeExpectedReleaseDateForm {
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

    return releaseDateResult.error
      ? {
          paramsForUpdate: null,
          error: {
            errors: [...(releaseDateResult.error?.errors ?? [])],
          },
        }
      : {
          paramsForUpdate: {
            hasExpectedReleaseDate: true,
            expectedReleaseDate: releaseDateResult.value.iso8601,
            expectedReleaseDateMissingReason: null,
          },
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
}
