import { Request } from 'express'
import { DraftReferral } from '../../services/interventionsService'
import { DesiredOutcomesError } from './desiredOutcomesPresenter'
import errorMessages from '../../utils/errorMessages'

export default class DesiredOutcomesForm {
  private constructor(private readonly request: Request) {}

  static async createForm(request: Request): Promise<DesiredOutcomesForm> {
    return new DesiredOutcomesForm(request)
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      desiredOutcomesIds: this.request.body['desired-outcomes-ids'],
    }
  }

  get isValid(): boolean {
    return this.request.body['desired-outcomes-ids'] !== null && this.request.body['desired-outcomes-ids'] !== undefined
  }

  get error(): DesiredOutcomesError | null {
    if (this.isValid) {
      return null
    }

    return { message: errorMessages.desiredOutcomes.empty }
  }
}
