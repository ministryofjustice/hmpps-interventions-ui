import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../../../utils/errorMessages'
import FormUtils from '../../../../../utils/formUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { DraftOasysRiskInformation } from '../../../../../models/draftOasysRiskInformation'

export default class EditOasysRiskInformationForm {
  private constructor(private readonly request: Request, private readonly result: Result<ValidationError>) {}

  static async createForm(request: Request): Promise<EditOasysRiskInformationForm> {
    return new EditOasysRiskInformationForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() })
    )
  }

  static validations(): ValidationChain[] {
    return [
      body('confirm-understood')
        .contains('understood')
        .withMessage(errorMessages.oasysRiskInformation.confirmUnderstood.notSelected),
    ]
  }

  get isValid(): boolean {
    return this.error == null
  }

  get editedDraftRiskInformation(): DraftOasysRiskInformation {
    return {
      riskSummaryWhoIsAtRisk: this.request.body['who-is-at-risk'],
      riskSummaryNatureOfRisk: this.request.body['nature-of-risk'],
      riskSummaryRiskImminence: this.request.body['risk-imminence'],
      riskToSelfSuicide: this.request.body['risk-to-self-suicide'],
      riskToSelfSelfHarm: this.request.body['risk-to-self-self-harm'],
      riskToSelfHostelSetting: this.request.body['risk-to-self-hostel-setting'],
      riskToSelfVulnerability: this.request.body['risk-to-self-vulnerability'],
      additionalInformation: this.request.body['additional-information'],
    }
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
