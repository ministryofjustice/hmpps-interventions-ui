import { Request } from 'express'
import * as ExpressValidator from 'express-validator'
import { Result, ValidationError } from 'express-validator'
import { FormValidationResult } from '../formValidationResult'
import FormUtils from '../../formUtils'
import PresenterUtils from '../../presenterUtils'
import DeliusOfficeLocation from '../../../models/deliusOfficeLocation'

export interface DeliusOfficeLocationErrorMessages {
  empty: string
  invalidOfficeSelection: string
}

export default class DeliusOfficeLocationInput {
  constructor(
    private readonly request: Request,
    private readonly key: string,
    private readonly deliusOfficeLocations: DeliusOfficeLocation[],
    private readonly errorMessages: DeliusOfficeLocationErrorMessages
  ) {}

  private readonly utils = new PresenterUtils(this.request.body)

  async validate(): Promise<FormValidationResult<string>> {
    const validationResult = await this.runValidations()
    const error = FormUtils.validationErrorFromResult(validationResult)
    if (error) {
      return { value: null, error }
    }

    return {
      value: this.selection!,
      error: null,
    }
  }

  private async runValidations(): Promise<Result<ValidationError>> {
    const validation: Result<ValidationError> = await FormUtils.runValidations({
      request: this.request,
      validations: this.validations,
    })
    return validation
  }

  private get validations(): ExpressValidator.ValidationChain[] {
    return [
      ExpressValidator.body(this.key)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(this.errorMessages.empty)
        .bail()
        .isIn(this.deliusOfficeLocations.map(office => office.deliusCRSLocationId))
        .withMessage(this.errorMessages.invalidOfficeSelection),
    ]
  }

  private get selection(): string | null {
    return this.utils.selectionValue(null, this.key, null).value ?? null
  }
}
