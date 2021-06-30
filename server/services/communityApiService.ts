import createError from 'http-errors'
import type HmppsAuthService from './hmppsAuthService'
import RestClient from '../data/restClient'
import logger from '../../log'
import DeliusUser from '../models/delius/deliusUser'
import DeliusServiceUser, { ExpandedDeliusServiceUser } from '../models/delius/deliusServiceUser'
import DeliusConviction from '../models/delius/deliusConviction'
import { DeliusStaffDetails } from '../models/delius/deliusStaffDetails'

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

  async getExpandedServiceUserByCRN(crn: string): Promise<ExpandedDeliusServiceUser> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn }, 'getting all details for offender')
    try {
      return (await this.restClient.get({
        path: `/secure/offenders/crn/${crn}/all`,
        token,
      })) as ExpandedDeliusServiceUser
    } catch (err) {
      throw createError(err.status, err, { userMessage: 'Could not retrieve service user details from nDelius.' })
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

  async getStaffDetails(username: string): Promise<DeliusStaffDetails> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ username }, 'getting staff details for officer')
    return (await this.restClient.get({
      path: `/staff/username/${username}`,
      token,
    })) as DeliusStaffDetails
  }
}
