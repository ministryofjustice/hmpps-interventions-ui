import type HmppsAuthService from './hmppsAuthService'
import RestClient, { RestClientError } from '../data/restClient'
import logger from '../../log'
import DeliusConviction from '../models/delius/deliusConviction'

export type CommunityApiServiceError = RestClientError

export default class CommunityApiService {
  constructor(private readonly hmppsAuthService: HmppsAuthService, private readonly restClient: RestClient) {}

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
