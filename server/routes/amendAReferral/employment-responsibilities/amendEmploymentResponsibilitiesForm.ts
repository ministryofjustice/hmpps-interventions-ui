import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { AmendOtherNeeds } from '../../../models/OtherNeeds'

export default class AmendEmploymentResponsibilitiesForm {
  static readonly amendEmploymentResponsibilitiesReasonForChangeId = 'reason-for-change'

  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AmendOtherNeeds>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendEmploymentResponsibilitiesForm.validations,
    })

    const noChangesMade = this.checkForNoChangesError(validationResult)
    if (noChangesMade) {
      return {
        paramsForUpdate: {
          changesMade: false,
        },
        error: null,
      }
    }

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        hasAdditionalResponsibilities: this.request.body['has-additional-responsibilities'] === 'yes',
        whenUnavailable:
          this.request.body['has-additional-responsibilities'] === 'yes' ? this.request.body['when-unavailable'] : null,
        reasonForChange:
          this.request.body[AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId],
        changesMade: true,
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('when-unavailable')
        .if(body('has-additional-responsibilities').equals('yes'))
        .notEmpty()
        .withMessage(errorMessages.employmentResponsibilities.whenUnavailable.empty),
      body(AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
      body('has-additional-responsibilities')
        .custom((value, { req }) => {
          return (
            value !== req.body?.originalEmploymentResponsibilities.hasAdditionalResponsibilities ||
            req.body?.originalEmploymentResponsibilities.whenUnavailable !== req.body['when-unavailable']
          )
        })
        .withMessage('no changes'),
    ]
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

  private checkForNoChangesError(validationResult: Result<ValidationError>): boolean | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return validationResult.array().some(validationError => {
      return validationError.msg === 'no changes'
    })
  }
}
