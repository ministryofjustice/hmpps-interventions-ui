import { Request } from 'express'
import { Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../models/draftReferral'
import errorMessages from '../../utils/errorMessages'
import FormUtils from '../../utils/formUtils'
import { FormValidationError } from '../../utils/formValidationError'
import Intervention from '../../models/intervention'

export default class RarDaysForm {
  private constructor(private readonly request: Request, private readonly result: Result<ValidationError>) {}

  static async createForm(request: Request, intervention: Intervention): Promise<RarDaysForm> {
    return new RarDaysForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations(intervention) })
    )
  }

  static validations(intervention: Intervention): ValidationChain[] {
    const referralName = intervention.contractType.name

    return FormUtils.yesNoRadioWithConditionalInputValidationChain({
      radioName: 'using-rar-days',
      inputName: 'maximum-rar-days',
      notSelectedErrorMessage: errorMessages.usingRarDays.empty(referralName),
      inputValidator: chain =>
        chain
          .notEmpty({ ignore_whitespace: true })
          .withMessage(errorMessages.maximumRarDays.empty(referralName))
          .bail()
          .trim()
          .isNumeric()
          .withMessage(errorMessages.maximumRarDays.notNumber(referralName))
          .bail()
          .isInt()
          .withMessage(errorMessages.maximumRarDays.notWholeNumber(referralName)),
    })
  }

  get isValid(): boolean {
    return this.error == null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      usingRarDays: this.usingRarDays,
      maximumRarDays: this.usingRarDays ? Number(this.request.body['maximum-rar-days']) : null,
    }
  }

  private get usingRarDays(): boolean {
    return this.request.body['using-rar-days'] === 'yes'
  }

  get error(): FormValidationError | null {
    return FormUtils.validationErrorFromResult(this.result)
  }
}
