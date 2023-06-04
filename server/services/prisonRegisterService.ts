import logger from '../../log'
import config from '../config'
import RestClient from '../data/restClient'
import Prison from '../models/prisonRegister/prison'

export default class PrisonRegisterService {
  private restClient(): RestClient {
    return new RestClient('Prison Register Client', config.apis.prisonRegister, null)
  }

  async getPrisons(): Promise<Prison[]> {
    logger.info(`Getting prisons with prison register`)
    return (await this.restClient().get({ path: '/prisons/search?active=true' })) as Prison[]
  }
}
