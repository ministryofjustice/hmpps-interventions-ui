import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'
import { WithdrawalState } from '../../../../models/sentReferral'

export default class ReferralWithdrawalReasonForm {
  constructor(
    private readonly request: Request,
    private readonly withdrawalState: WithdrawalState
  ) {}

  async data(): Promise<FormData<{ withdrawalReason: string; withdrawalComments: string; withdrawalState: string }>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: this.validations(),
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        withdrawalReason: this.request.body?.['withdrawal-reason'],
        withdrawalComments: this.request.body?.[`withdrawal-comments-${this.request.body?.['withdrawal-reason']}`],
        withdrawalState: this.getWithdrawalState(), // Determine based on reason to return a new state back to service.
      },
      error: null,
    }
  }

  validations(): ValidationChain[] {
    const reason = this.request.body?.['withdrawal-reason'] || ''
    return [
      body('withdrawal-reason')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.withdrawReferral.withdrawalReason.empty),
      body(`withdrawal-comments-${reason}`)
        .if(body('withdrawal-reason').notEmpty({ ignore_whitespace: true }))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.withdrawReferral.withdrawalComments.empty),
    ]
  }

  private getWithdrawalState(): WithdrawalState {
    if (this.withdrawalState === WithdrawalState.preICA) {
      return this.withdrawalState
    }
    if (this.request.body['withdrawal-reason'] === 'EAR') {
      return WithdrawalState.postICAClosed
    }
    return WithdrawalState.postICA
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
}
