import { Request } from 'express'
import { Result, ValidationChain, ValidationError } from 'express-validator'
import { DraftReferral } from '../../services/interventionsService'
import errorMessages from '../../utils/errorMessages'
import FormUtils from '../../utils/formUtils'
import { FormValidationError } from '../../utils/formValidationError'

export default class NeedsAndRequirementsForm {
  private constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>,
    private readonly referral: DraftReferral
  ) {}

  static async createForm(request: Request, referral: DraftReferral): Promise<NeedsAndRequirementsForm> {
    return new NeedsAndRequirementsForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations(referral) }),
      referral
    )
  }

  static validations(referral: DraftReferral): ValidationChain[] {
    const firstName = referral.serviceUser?.firstName ?? ''

    return [
      FormUtils.yesNoRadioWithConditionalInputValidationChain({
        radioName: 'needs-interpreter',
        inputName: 'interpreter-language',
        notSelectedErrorMessage: errorMessages.needsInterpreter.empty(firstName),
        inputValidator: chain =>
          chain.notEmpty({ ignore_whitespace: true }).withMessage(errorMessages.interpreterLanguage.empty(firstName)),
      }),
      FormUtils.yesNoRadioWithConditionalInputValidationChain({
        radioName: 'has-additional-responsibilities',
        inputName: 'when-unavailable',
        notSelectedErrorMessage: errorMessages.hasAdditionalResponsibilities.empty(firstName),
        inputValidator: chain =>
          chain.notEmpty({ ignore_whitespace: true }).withMessage(errorMessages.whenUnavailable.empty(firstName)),
      }),
    ].reduce((a, b) => a.concat(b), [])
  }

  get isValid(): boolean {
    return this.error == null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      additionalNeedsInformation: this.request.body['additional-needs-information'],
      accessibilityNeeds: this.request.body['accessibility-needs'],
      needsInterpreter: this.needsInterpeter,
      interpreterLanguage: this.needsInterpeter ? this.request.body['interpreter-language'] : null,
      hasAdditionalResponsibilities: this.hasAdditionalResponsibilities,
      whenUnavailable: this.hasAdditionalResponsibilities ? this.request.body['when-unavailable'] : null,
    }
  }

  private get needsInterpeter(): boolean {
    return this.request.body['needs-interpreter'] === 'yes'
  }

  private get hasAdditionalResponsibilities(): boolean {
    return this.request.body['has-additional-responsibilities'] === 'yes'
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
