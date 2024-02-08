import logger from '../../log'
import config from '../config'
import RestClient from '../data/restClient'
import SecureChildrenAgencies from '../models/prisonApi/secureChildrenAgencies'

export default class PrisonApiService {
  private restClient(clientToken: string): RestClient {
    return new RestClient('Prison Api Client', config.apis.prisonApi, clientToken)
  }

  async getSecureChildrenAgencies(clientToken: string): Promise<SecureChildrenAgencies[]> {
    logger.info(`Getting secure children establishment with prison api`)
    return (await this.restClient(clientToken).get({
      path: '/api/agencies/type/SCH?activeOnly=true',
      headers: { Accept: 'application/json' },
    })) as SecureChildrenAgencies[]
  }
}
