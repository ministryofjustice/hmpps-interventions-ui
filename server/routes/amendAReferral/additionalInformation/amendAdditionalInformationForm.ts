import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { ReferralAdditionalInformationUpdate } from '../../../models/referralAdditionalInformation'
import { FormValidationError } from '../../../utils/formValidationError'

export default class AmendAdditionalInformationForm {
  static readonly additionalInformationId = 'additional-information'

  static readonly reasonForChangeId = 'reason-for-change'

  constructor(private readonly request: Request) {}

  static get validations(): ValidationChain[] {
    return [
      body(AmendAdditionalInformationForm.reasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
      body(AmendAdditionalInformationForm.additionalInformationId)
        .custom((value, { req }) => {
          const original = req.body.additionalNeedsInformation
          return original !== value
        })
        .withMessage(errorMessages.additionalInformation.noChanges),
    ]
  }

  async data(): Promise<FormData<ReferralAdditionalInformationUpdate>> {
    const reasonResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendAdditionalInformationForm.validations,
    })

    const noChangesMade = this.checkForNoChangesError(reasonResult)

    if (noChangesMade) {
      return {
        paramsForUpdate: {
          changesMade: false,
          reasonForChange: null,
          additionalNeedsInformation: null,
        },
        error: null,
      }
    }

    const error = this.error(reasonResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        additionalNeedsInformation: this.request.body[AmendAdditionalInformationForm.additionalInformationId],
        reasonForChange: this.request.body[AmendAdditionalInformationForm.reasonForChangeId],
        changesMade: true,
      },
      error: null,
    }
  }

  private checkForNoChangesError(validationResult: Result<ValidationError>): boolean | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return validationResult.array().some(validationError => {
      return validationError.msg === errorMessages.additionalInformation.noChanges
    })
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
