import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../../utils/errorMessages'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class ConfirmOasysRiskInformationForm {
  private constructor(private readonly request: Request, private readonly result: Result<ValidationError>) {}

  static async createForm(request: Request): Promise<ConfirmOasysRiskInformationForm> {
    return new ConfirmOasysRiskInformationForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() })
    )
  }

  private static validations(): ValidationChain[] {
    const radioSelection = body('edit-risk-confirmation')
    const confirmationCheckBox = body('confirm-understood')

    return [
      radioSelection.isIn(['yes', 'no']).withMessage(errorMessages.oasysRiskInformation.edit.empty),
      confirmationCheckBox
        .if(body('edit-risk-confirmation').equals('no'))
        .contains('understood')
        .withMessage(errorMessages.oasysRiskInformation.confirmUnderstood.notSelected),
    ]
  }

  get isValid(): boolean {
    return this.error == null
  }

  get userWantsToEdit(): boolean {
    return this.request.body['edit-risk-confirmation'] === 'yes'
  }

  get error(): FormValidationError | null {
    if (this.result.isEmpty()) {
      return null
    }

    return {
      errors: this.result.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }
}
