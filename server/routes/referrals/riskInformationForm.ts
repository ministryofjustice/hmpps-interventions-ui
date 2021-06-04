import { Request } from 'express'
import * as ExpressValidator from 'express-validator'
import DraftReferral from '../../models/draftReferral'
import { FormData } from '../../utils/forms/formData'
import FormUtils from '../../utils/formUtils'
import errorMessages from '../../utils/errorMessages'

export default class RiskInformationForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const result = await FormUtils.runValidations({
      request: this.request,
      validations: RiskInformationForm.validations,
    })

    const error = FormUtils.validationErrorFromResult(result)
    if (error !== null) {
      return { error, paramsForUpdate: null }
    }

    return {
      paramsForUpdate: { additionalRiskInformation: this.request.body['additional-risk-information'] },
      error: null,
    }
  }

  private static get validations(): ExpressValidator.ValidationChain[] {
    return [
      ExpressValidator.body('additional-risk-information')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.riskInformation.empty)
        .isLength({ max: 4000 })
        .withMessage(errorMessages.riskInformation.tooLong),
    ]
  }
}
