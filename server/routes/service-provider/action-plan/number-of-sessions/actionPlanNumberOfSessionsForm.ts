import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import { UpdateDraftActionPlanParams } from '../../../../services/interventionsService'
import errorMessages from '../../../../utils/errorMessages'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class ActionPlanNumberOfSessionsForm {
  private constructor(private readonly request: Request, private readonly result: Result<ValidationError>) {}

  static async createForm(request: Request): Promise<ActionPlanNumberOfSessionsForm> {
    return new ActionPlanNumberOfSessionsForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations })
    )
  }

  static get validations(): ValidationChain[] {
    return [
      body('number-of-sessions')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.actionPlanNumberOfSessions.empty)
        .bail()
        .trim()
        .isNumeric()
        .withMessage(errorMessages.actionPlanNumberOfSessions.notNumber)
        .bail()
        .isInt()
        .withMessage(errorMessages.actionPlanNumberOfSessions.notWholeNumber)
        .bail()
        .isInt({ min: 1 })
        .withMessage(errorMessages.actionPlanNumberOfSessions.tooSmall),
    ]
  }

  get isValid(): boolean {
    return this.error === null
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

  get paramsForUpdate(): Partial<UpdateDraftActionPlanParams> {
    return {
      numberOfSessions: Number(this.request.body['number-of-sessions']),
    }
  }
}
