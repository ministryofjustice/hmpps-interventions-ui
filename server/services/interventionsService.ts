import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'
import HmppsAuthClient from '../data/hmppsAuthClient'

export interface DraftReferral {
  id: string
  completionDeadline: string | null
  serviceCategory: ServiceCategory | null
  complexityLevelId: string | null
}

export interface ServiceCategory {
  id: string
  name: string
}

export interface ComplexityLevel {
  id: string
  title: string
  description: string
}

export default class InterventionsService {
  constructor(private readonly config: ApiConfig) {}

  private createRestClient(token: string): RestClient {
    return new RestClient('Interventions Service API Client', this.config, token)
  }

  async getDraftReferral(token: string, id: string): Promise<DraftReferral> {
    logger.info(`Getting draft referral with id ${id}`)

    const restClient = await this.createRestClient(token)

    return (await restClient.get({
      path: `/draft-referral/${id}`,
      headers: { Accept: 'application/json' },
    })) as DraftReferral
  }

  async createDraftReferral(token: string): Promise<DraftReferral> {
    const restClient = await this.createRestClient(token)

    return (await restClient.post({
      path: `/draft-referral`,
      headers: { Accept: 'application/json' },
    })) as DraftReferral
  }

  async patchDraftReferral(token: string, id: string, patch: Partial<DraftReferral>): Promise<DraftReferral> {
    const restClient = await this.createRestClient(token)

    return (await restClient.patch({
      path: `/draft-referral/${id}`,
      headers: { Accept: 'application/json' },
      data: patch,
    })) as DraftReferral
  }
}
