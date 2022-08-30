import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import EnforceableDaysForm from '../../makeAReferral/enforceable-days/enforceableDaysForm'
import {AmmendNeedsRequirementsDetailsUpdate}  from '../../../models/amendAndNeedsRequirementsIntepreter'
import { FormValidationError } from '../../../utils/formValidationError'

export default class AmendNeedsAndRequirementsIntepreterForm {

  static readonly reasonForChangeId = 'reason-for-change'

  constructor(private readonly request: Request) {
  }

  static get validations(): ValidationChain[] {
    return [
      body(AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
    ]
  }

  async data(): Promise<FormData<AmmendNeedsRequirementsDetailsUpdate>> {
  
    const reasonResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendNeedsAndRequirementsIntepreterForm.validations,
    })

    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendNeedsAndRequirementsIntepreterForm.validations,
    })
    const noChangesMade = this.checkForNoChangesError(validationResult)
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
          needsInterpreter: this.request.params.needsInterpreter==='true',
          interpreterLanguage:  this.request.params.interpreterLanguage,
          changesMade: noChangesMade
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

 
  private checkForNoChangesError(validationResult: Result<ValidationError>): boolean {
    if (validationResult.isEmpty()) {
      
    }

    return validationResult.array().some(validationError => {
      return validationError.msg === errorMessages.desiredOutcomes.noChanges
    })
  }
    
}
