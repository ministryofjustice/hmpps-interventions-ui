import { Request } from 'express'
import { Result, ValidationChain, ValidationError } from 'express-validator'
import { DraftReferral, ServiceCategory } from '../../services/interventionsService'
import errorMessages from '../../utils/errorMessages'
import FormUtils from '../../utils/formUtils'

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
    return this.errors == null
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

  get errors(): { field: string; message: string }[] | null {
    if (this.result.isEmpty()) {
      return null
    }

    return this.result.array().map(validationError => ({ field: validationError.param, message: validationError.msg }))
  }
}
