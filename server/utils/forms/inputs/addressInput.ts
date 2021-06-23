import { Request } from 'express'
import * as ExpressValidator from 'express-validator'
import { FormValidationResult } from '../formValidationResult'
import { Address } from '../../../models/actionPlan'
import { FormValidationError } from '../../formValidationError'
import FormUtils from '../../formUtils'
import PresenterUtils from '../../presenterUtils'

export interface AddressErrorMessages {
  addressLine1Empty: string
  townOrCityEmpty: string
  countyEmpty: string
  postCodeEmpty: string
  postCodeInvalid: string
}

export default class AddressInput {
  constructor(
    private readonly request: Request,
    private readonly key: string,
    private readonly errorMessages: AddressErrorMessages
  ) {}

  private readonly utils = new PresenterUtils(this.request.body)

  private get keys() {
    return {
      addressLine1: `${this.key}-address-line-1`,
      addressLine2: `${this.key}-address-line-2`,
      townOrCity: `${this.key}-address-town-or-city`,
      county: `${this.key}-address-county`,
      postCode: `${this.key}-address-postcode`,
    }
  }

  async validate(): Promise<FormValidationResult<Address>> {
    const validationResult = await FormUtils.runValidations({ request: this.request, validations: this.validations })
    const error = this.extractErrors(validationResult)
    if (error) {
      return { value: null, error }
    }

    return {
      value: this.address!,
      error: null,
    }
  }

  private get validations(): ExpressValidator.ValidationChain[] {
    return [
      ExpressValidator.body(this.keys.addressLine1)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.addressLine1Empty),

      ExpressValidator.body(this.keys.postCode)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.postCodeEmpty),

      ExpressValidator.body(this.keys.postCode)
        .matches(/^\s*[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}\s*$/)
        .withMessage(this.errorMessages.postCodeInvalid),
    ]
  }

  private extractErrors(result: ExpressValidator.Result): FormValidationError | null {
    const formValidationError = FormUtils.validationErrorFromResult(result)
    if (formValidationError !== null) {
      return formValidationError
    }
    return null
  }

  private get address(): Address | null {
    return this.utils.addressValue(null, 'method-other-location', null).value ?? null
  }
}
