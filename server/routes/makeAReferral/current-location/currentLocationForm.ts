import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import Prisoner from '../../../models/prisonerOffenderSearch/prisoner'

export default class CurrentLocationForm {
  private constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>,
    private readonly referral: DraftReferral,
    private readonly prisonId: string | null
  ) {}

  static async createForm(
    request: Request,
    referral: DraftReferral,
    prisonerDetails: Prisoner | null
  ): Promise<CurrentLocationForm> {
    return new CurrentLocationForm(
      request,
      await FormUtils.runValidations({
        request,
        validations:
          prisonerDetails !== null
            ? this.validationsWhenPrisonNameIsPresent()
            : this.validationsWhenPrisonNameIsNotPresent(),
      }),
      referral,
      prisonerDetails !== null ? prisonerDetails.prisonId : null
    )
  }

  static validationsWhenPrisonNameIsPresent(): ValidationChain[] {
    return [
      body('already-know-prison-name').isIn(['yes', 'no']).withMessage(errorMessages.prisonRelease.emptyRadio),
      body('prison-select')
        .if(body('already-know-prison-name').equals('no'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.currentLocation.empty),
    ]
  }

  static validationsWhenPrisonNameIsNotPresent(): ValidationChain[] {
    return [
      body('prison-select').notEmpty({ ignore_whitespace: true }).withMessage(errorMessages.currentLocation.empty),
    ]
  }

  get isValid(): boolean {
    return this.error === null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      alreadyKnowPrisonName: this.alreadyKnowPrisonName,
      personCustodyPrisonId: this.alreadyKnowPrisonName ? this.prisonId : this.request.body['prison-select'],
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

  private get alreadyKnowPrisonName(): boolean {
    return this.request.body['already-know-prison-name'] === 'yes'
  }
}
