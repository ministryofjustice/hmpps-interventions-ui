import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'
import HmppsAuthClient from '../data/hmppsAuthClient'

export interface Referral {
  id: string
}

export default class InterventionsService {
  constructor(private readonly config: ApiConfig, private readonly hmppsAuthClient: HmppsAuthClient) {}

  private async createRestClient(): Promise<RestClient> {
    const token = await this.hmppsAuthClient.getApiClientToken()

    return new RestClient('Interventions Service API Client', this.config, token)
  }

  async getReferral(id: string): Promise<Referral> {
    logger.info(`Getting draft referral with id ${id}`)

    const restClient = await this.createRestClient()

    return (await restClient.get({
      path: `/draft-referral/${id}`,
      headers: { Accept: 'application/json' },
    })) as Referral
  }

  async createReferral(): Promise<Referral> {
    const restClient = await this.createRestClient()

    return (await restClient.post({
      path: `/draft-referral`,
      headers: { Accept: 'application/json' },
    })) as Referral
  }
}
