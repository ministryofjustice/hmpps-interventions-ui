import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../log'
import DeliusUser from '../models/delius/deliusUser'
import DeliusServiceUser from '../models/delius/deliusServiceUser'
import DeliusConviction from '../models/delius/deliusConviction'

export default class CommunityApiService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private restClient(token: string): RestClient {
    return new RestClient('Community API Client', config.apis.communityApi, token)
  }

  async getUserByUsername(username: string): Promise<DeliusUser> {
    const token = await this.hmppsAuthClient.getApiClientToken()

    logger.info({ username }, 'getting user details')
    return (await this.restClient(token).get({ path: `/secure/users/${username}/details` })) as DeliusUser
  }

  async getServiceUserByCRN(crn: string): Promise<DeliusServiceUser> {
    const token = await this.hmppsAuthClient.getApiClientToken()
    logger.info({ crn }, 'getting details for offender')
    return (await this.restClient(token).get({ path: `/secure/offenders/crn/${crn}` })) as DeliusServiceUser
  }

  async getActiveConvictionsByCRN(crn: string): Promise<DeliusConviction[]> {
    const token = await this.hmppsAuthClient.getApiClientToken()
    logger.info({ crn }, 'getting conviction for service user')
    const convictions = (await this.restClient(token).get({
      path: `/secure/offenders/crn/${crn}/convictions`,
    })) as DeliusConviction[]

    return convictions.filter(conviction => conviction.active && conviction.sentence)
  }
}
