import { Request } from 'express'
import { Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import errorMessages from '../../utils/errorMessages'
import FormUtils from '../../utils/formUtils'
import { FormValidationError } from '../../utils/formValidationError'

export default class RarDaysForm {
  private constructor(private readonly request: Request, private readonly result: Result<ValidationError>) {}

  static async createForm(request: Request, serviceCategory: ServiceCategory): Promise<RarDaysForm> {
    return new RarDaysForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations(serviceCategory) })
    )
  }

  static validations(serviceCategory: ServiceCategory): ValidationChain[] {
    const firstName = serviceCategory.name

    return FormUtils.yesNoRadioWithConditionalInputValidationChain({
      radioName: 'using-rar-days',
      inputName: 'maximum-rar-days',
      notSelectedErrorMessage: errorMessages.usingRarDays.empty(firstName),
      inputValidator: chain =>
        chain
          .notEmpty({ ignore_whitespace: true })
          .withMessage(errorMessages.maximumRarDays.empty(serviceCategory.name))
          .bail()
          .trim()
          .isNumeric()
          .withMessage(errorMessages.maximumRarDays.notNumber(serviceCategory.name))
          .bail()
          .isInt()
          .withMessage(errorMessages.maximumRarDays.notWholeNumber(serviceCategory.name)),
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
