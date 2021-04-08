import type HmppsAuthService from './hmppsAuthService'
import RestClient from '../data/restClient'
import logger from '../../log'
import DeliusUser from '../models/delius/deliusUser'
import DeliusServiceUser from '../models/delius/deliusServiceUser'
import DeliusConviction from '../models/delius/deliusConviction'

export default class CommunityApiService {
  constructor(private readonly hmppsAuthService: HmppsAuthService, private readonly restClient: RestClient) {}

  async getUserByUsername(username: string): Promise<DeliusUser> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ username }, 'getting user details')
    return (await this.restClient.get({ path: `/secure/users/${username}/details`, token })) as DeliusUser
  }

  async getServiceUserByCRN(crn: string): Promise<DeliusServiceUser> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn }, 'getting details for offender')
    return (await this.restClient.get({ path: `/secure/offenders/crn/${crn}`, token })) as DeliusServiceUser
  }

  async getActiveConvictionsByCRN(crn: string): Promise<DeliusConviction[]> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn }, 'getting convictions for service user')
    const convictions = (await this.restClient.get({
      path: `/secure/offenders/crn/${crn}/convictions`,
      token,
    })) as DeliusConviction[]

    return convictions.filter(conviction => conviction.active && conviction.sentence)
  }

  async getConvictionById(crn: string, id: number): Promise<DeliusConviction> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn, id }, 'getting conviction for service user')
    return (await this.restClient.get({
      path: `/secure/offenders/crn/${crn}/convictions/${id}`,
      token,
    })) as DeliusConviction
  }
}
