import { Request } from 'express'
import errorMessages from '../../utils/errorMessages'
import { FormValidationError } from '../../utils/formValidationError'

export default class ReferralStartForm {
  private constructor(private readonly request: Request) {}

  static async createForm(request: Request): Promise<ReferralStartForm> {
    return new ReferralStartForm(request)
  }

  get isValid(): boolean {
    return this.error === null
  }

  get error(): FormValidationError | null {
    const crn = this.request.body['service-user-crn']

    let error: FormValidationError | null = null

    if (crn === null || crn === '' || crn === undefined) {
      error = {
        errors: [
          {
            formFields: ['service-user-crn'],
            errorSummaryLinkedField: 'service-user-crn',
            message: errorMessages.startReferral.crnEmpty,
          },
        ],
      }
    }

    return error
  }
}
