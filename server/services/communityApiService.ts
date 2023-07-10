import createError from 'http-errors'
import type HmppsAuthService from './hmppsAuthService'
import RestClient, { RestClientError } from '../data/restClient'
import logger from '../../log'
import DeliusServiceUser, { ExpandedDeliusServiceUser } from '../models/delius/deliusServiceUser'
import DeliusConviction from '../models/delius/deliusConviction'

export type CommunityApiServiceError = RestClientError

export default class CommunityApiService {
  constructor(private readonly hmppsAuthService: HmppsAuthService, private readonly restClient: RestClient) {}

  async getServiceUserByCRN(crn: string): Promise<DeliusServiceUser> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn }, 'getting details for offender')
    return (await this.restClient.get({ path: `/secure/offenders/crn/${crn}`, token })) as DeliusServiceUser
  }

  async getExpandedServiceUserByCRN(crn: string): Promise<ExpandedDeliusServiceUser> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn }, 'getting all details for offender')
    try {
      return (await this.restClient.get({
        path: `/secure/offenders/crn/${crn}/all`,
        token,
      })) as ExpandedDeliusServiceUser
    } catch (err) {
      const restClientError = err as RestClientError
      throw createError(restClientError.status || 500, restClientError, {
        userMessage: 'Could not retrieve service user details from nDelius.',
      })
    }
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
