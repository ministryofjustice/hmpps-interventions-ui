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

  readonly checkFutureDateErrorMessage = 'Expected release date must be in the future'

  async data(): Promise<FormData<AmendExpectedReleaseDateUpdate>> {
    if (this.request.body?.['release-date'] === 'confirm') {
      const validateeDateCombinedResult = await this.validateDateCombined()
      if (validateeDateCombinedResult !== null) {
        return validateeDateCombinedResult
      }
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
        body('amend-expected-release-date-day')
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

  async validateDateCombined(): Promise<FormData<AmendExpectedReleaseDateUpdate> | null> {
    const dayField = 'amend-expected-release-date-day'
    const monthField = 'amend-expected-release-date-month'
    const yearField = 'amend-expected-release-date-year'

    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: [
        body([dayField]).custom(() => {
          const year = this.request.body[yearField]
          const month = this.request.body[monthField]
          const day = this.request.body[dayField]

          const missing: string[] = []
          if (this.isBlank(day)) missing.push('day')
          if (this.isBlank(month)) missing.push('month')
          if (this.isBlank(year)) missing.push('year')

          if (missing.length >= 2) {
            const msg =
              missing.length === 3
                ? 'Enter the expected release date'
                : `Expected release date must include a ${missing[0]} and a ${missing[1]}`
            throw new Error(msg)
          }
          return true
        }),
      ],
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    // If there is no error, return a valid FormData or null as appropriate
    return null
  }

  isBlank(v: unknown): boolean {
    return v === undefined || v === null || String(v).trim() === ''
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
        expectedReleaseDateMissingReason: this.request.body?.['amend-date-unknown-reason'],
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
