import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import { AmmendNeedsRequirementsDetailsUpdate } from '../../../models/amendAndNeedsRequirementsIntepreter'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'

export default class AmendNeedsAndRequirementsIntepreterForm {
  static readonly reasonForChangeId = 'reason-for-change'

  static readonly interpreterLanguageId = 'interpreter-language'

  static readonly needsIntepreterId = 'needs-interpreter'

  constructor(private readonly request: Request) {}

  static get validations(): ValidationChain[] {
    return [
      body(AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
      body(AmendNeedsAndRequirementsIntepreterForm.interpreterLanguageId)
        .custom((value, { req }) => {
          return req.body[AmendNeedsAndRequirementsIntepreterForm.needsIntepreterId] !== 'yes' || value !== ''
        })
        .withMessage(errorMessages.interpreterLanguageWithoutName.empty),
      body(AmendNeedsAndRequirementsIntepreterForm.interpreterLanguageId)
        .custom((value, { req }) => {
          return (
            value !== req.body?.originalInterpreterNeeds?.intepreterLanguage ||
            req.body?.originalInterpreterNeeds?.intepreterNeeded !==
              req.body[AmendNeedsAndRequirementsIntepreterForm.needsIntepreterId]
          )
        })
        .withMessage(errorMessages.needsInterpreterWithoutName.noChanges),
    ]
  }

  async data(): Promise<FormData<Partial<AmmendNeedsRequirementsDetailsUpdate>>> {
    await FormUtils.runValidations({
      request: this.request,
      validations: AmendNeedsAndRequirementsIntepreterForm.validations,
    })

    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendNeedsAndRequirementsIntepreterForm.validations,
    })
    const needsInterpreter = this.request.body[AmendNeedsAndRequirementsIntepreterForm.needsIntepreterId] === 'yes'
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
      error: null,
      paramsForUpdate: {
        reasonForChange: this.request.body[AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId],
        needsInterpreter,
        interpreterLanguage: this.request.body[AmendNeedsAndRequirementsIntepreterForm.interpreterLanguageId],
        changesMade: true,
      },
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

  private checkForNoChangesError(validationResult: Result<ValidationError>): boolean | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return validationResult.array().some(validationError => {
      return validationError.msg === errorMessages.needsInterpreterWithoutName.noChanges
    })
  }
}
