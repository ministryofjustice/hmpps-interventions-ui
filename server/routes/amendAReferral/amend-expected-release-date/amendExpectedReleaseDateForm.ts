import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import { FormValidationError } from '../../../utils/formValidationError'
import AmendExpectedReleaseDateUpdate from '../../../models/referralExpectedReleaseDate'
import CalendarDayInput from '../../../utils/forms/inputs/calendarDayInput'
import FormUtils from '../../../utils/formUtils'

export default class AmendExpectedReleaseDateForm {
  constructor(
    private readonly request: Request,
    private readonly expectedReleaseDate: string | null
  ) {}

  readonly checkFutureDateErrorMessage = 'Enter date in the future'

  async data(): Promise<FormData<AmendExpectedReleaseDateUpdate>> {
    if (this.request.body['release-date'] === 'confirm') {
      return this.expectedReleaseDateData()
    }
    return this.expectedReleaseDateUnknownReasonData()
  }

  async expectedReleaseDateData(): Promise<FormData<AmendExpectedReleaseDateUpdate>> {
    const dateInput = new CalendarDayInput(
      this.request,
      'amend-expected-release-date',
      errorMessages.releaseDate,
      null,
      true,
      this.checkFutureDateErrorMessage,
      true,
      this.expectedReleaseDate
    )
    const releaseDateResult = await dateInput.validate()

    if (releaseDateResult.error !== null) {
      return {
        paramsForUpdate: null,
        error: {
          errors: [...(releaseDateResult.error?.errors ?? [])],
        },
      }
    }
    return {
      paramsForUpdate: {
        expectedReleaseDate: releaseDateResult.value.iso8601,
        expectedReleaseDateMissingReason: null,
      },
      error: null,
    }
  }

  async expectedReleaseDateUnknownReasonData(): Promise<FormData<AmendExpectedReleaseDateUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendExpectedReleaseDateForm.validations,
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }
    return {
      paramsForUpdate: {
        expectedReleaseDate: null,
        expectedReleaseDateMissingReason: this.request.body['amend-date-unknown-reason'],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('amend-date-unknown-reason').notEmpty().withMessage(errorMessages.prisonEstablishment.emptyReason)]
  }

  private error(validationResult: Result<ValidationError>): FormValidationError | null {
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
