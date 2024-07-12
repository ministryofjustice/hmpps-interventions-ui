import { Request } from 'express'
import { body, Result, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import { FormValidationError } from '../../../utils/formValidationError'
import AmendExpectedReleaseDateUpdate from '../../../models/referralExpectedReleaseDate'
import CalendarDayInput from '../../../utils/forms/inputs/calendarDayInput'
import FormUtils from '../../../utils/formUtils'

export default class AmendExpectedReleaseDateForm {
  constructor(
    private readonly request: Request,
    private readonly existingExpectedReleaseDate: string | null,
    private readonly existingExpectedReleaseDateMissingReason: string | null = null
  ) {}

  readonly checkFutureDateErrorMessage = 'Enter date in the future'

  async data(): Promise<FormData<AmendExpectedReleaseDateUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: [body('release-date').notEmpty().withMessage(errorMessages.expectedReleaseDate.emptyRadioButton)],
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

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
      this.checkFutureDateErrorMessage
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
    const expectedReleaseDateString = releaseDateResult.value.iso8601
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: [
        body('amend-expected-release-date')
          .custom(() => {
            return expectedReleaseDateString !== this.existingExpectedReleaseDate
          })
          .withMessage(errorMessages.expectedReleaseDate.noChangesinExpectedReleaseDate),
      ],
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
        expectedReleaseDate: expectedReleaseDateString,
        expectedReleaseDateMissingReason: null,
      },
      error: null,
    }
  }

  async expectedReleaseDateUnknownReasonData(): Promise<FormData<AmendExpectedReleaseDateUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: [
        body('amend-date-unknown-reason')
          .if(body('release-date').equals('change'))
          .notEmpty()
          .withMessage(errorMessages.expectedReleaseDate.emptyReason),
        body('amend-date-unknown-reason')
          .custom(() => {
            return this.existingExpectedReleaseDateMissingReason !== this.request.body['amend-date-unknown-reason']
          })
          .withMessage(errorMessages.expectedReleaseDate.noChangesinExpectedReleaseDateMissingReason),
      ],
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
