import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'

interface Referral {
  id: string
}

export default class InterventionsService {
  constructor(private readonly config: ApiConfig) {}

  private restClient(token: string): RestClient {
    return new RestClient('Interventions Service API Client', this.config, token)
  }

  async getReferral(id: string): Promise<Referral> {
    logger.info(`Getting referral with id ${id}`)
    return (await this.restClient('token').get({
      path: `/referrals/${id}`,
      headers: { Accept: 'application/json' },
    })) as Referral
  }
}
