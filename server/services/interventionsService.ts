import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'

export interface Referral {
  id: string
}

export default class InterventionsService {
  constructor(private readonly config: ApiConfig) {}

  private restClient(token: string): RestClient {
    return new RestClient('Interventions Service API Client', this.config, token)
  }

  async getReferral(id: string): Promise<Referral> {
    logger.info(`Getting draft referral with id ${id}`)
    return (await this.restClient('token').get({
      path: `/draft-referral/${id}`,
      headers: { Accept: 'application/json' },
    })) as Referral
  }

  async createReferral(): Promise<Referral> {
    return (await this.restClient('token').post({
      path: `/draft-referral`,
      headers: { Accept: 'application/json' },
    })) as Referral
  }
}
