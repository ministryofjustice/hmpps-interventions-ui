import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { ReferralNeedsAndRequirementUpdate } from '../../../models/referralNeedsAndRequirents'

export default class AmendNeedsAndRequirementsForm {
  static readonly reasonForChangeId = 'reason-for-change'

  private get needsInterpeter(): boolean {
    return this.request.body['needs-interpreter'] === 'yes'
  }

  private get hasAdditionalResponsibilities(): boolean {
    return this.request.body['has-additional-responsibilities'] === 'yes'
  }

  constructor(private readonly request: Request) {}

  static get validations(): ValidationChain[] {
    return [
      body(AmendNeedsAndRequirementsForm.reasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendNeedsAndRequirements.missingReason),
    ]
  }

  async data(): Promise<FormData<Partial<ReferralNeedsAndRequirementUpdate>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendNeedsAndRequirementsForm.validations,
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
        additionalNeedsInformation: this.request.body['additional-needs-information'],
        accessibilityNeeds: this.request.body['accessibility-needs'],
        needsInterpreter: this.needsInterpeter,
        interpreterLanguage: this.needsInterpeter ? this.request.body['interpreter-language'] : null,
        hasAdditionalResponsibilities: this.hasAdditionalResponsibilities,
        whenUnavailable: this.hasAdditionalResponsibilities ? this.request.body['when-unavailable'] : null,
        reasonForChange: this.request.body[AmendNeedsAndRequirementsForm.reasonForChangeId],
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
