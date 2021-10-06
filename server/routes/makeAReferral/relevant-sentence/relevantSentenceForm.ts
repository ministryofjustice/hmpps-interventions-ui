import { Request } from 'express'
import DraftReferral from '../../../models/draftReferral'
import errorMessages from '../../../utils/errorMessages'
import { FormValidationError } from '../../../utils/formValidationError'

export default class RelevantSentenceForm {
  private constructor(private readonly request: Request) {}

  static async createForm(request: Request): Promise<RelevantSentenceForm> {
    return new RelevantSentenceForm(request)
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      relevantSentenceId: Number(this.request.body['relevant-sentence-id']),
    }
  }

  get isValid(): boolean {
    return this.request.body['relevant-sentence-id'] !== null && this.request.body['relevant-sentence-id'] !== undefined
  }

  get error(): FormValidationError | null {
    if (this.isValid) {
      return null
    }

    return {
      errors: [
        {
          formFields: ['relevant-sentence-id'],
          errorSummaryLinkedField: 'relevant-sentence-id',
          message: errorMessages.relevantSentence.empty,
        },
      ],
    }
  }
}
