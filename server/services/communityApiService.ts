import createError from 'http-errors'
import type HmppsAuthService from './hmppsAuthService'
import RestClient from '../data/restClient'
import logger from '../../log'
import DeliusUser from '../models/delius/deliusUser'
import DeliusServiceUser, { ExpandedDeliusServiceUser } from '../models/delius/deliusServiceUser'
import DeliusConviction from '../models/delius/deliusConviction'
import { DeliusStaffDetails } from '../models/delius/deliusStaffDetails'
import { DeliusOffenderManager } from '../models/delius/deliusOffenderManager'

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

  async getStaffDetails(username: string): Promise<DeliusStaffDetails | null> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ username }, 'getting staff details for officer')
    try {
      return (await this.restClient.get({
        path: `/secure/staff/username/${username}`,
        token,
      })) as DeliusStaffDetails
    } catch (err) {
      if (err.status === 404) {
        // not all users will have staff details on delius
        return null
      }

      throw createError(err.status, err, { userMessage: 'Could retrieve staff details from nDelius.' })
    }
  }

  async getResponsibleOfficerForServiceUser(crn: string): Promise<DeliusOffenderManager | null> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn }, 'getting offender managers for service user')
    try {
      const deliusOffenderManagers = (await this.restClient.get({
        path: `/secure/offenders/crn/${crn}/allOffenderManagers`,
        token,
      })) as DeliusOffenderManager[]

      // we have an assumption that a SU only ever has one RO. this has been tested
      // in production and found to be true in 100% of cases we have seen so far.
      return deliusOffenderManagers.find(offenderManager => offenderManager.isResponsibleOfficer) || null
    } catch (err) {
      throw createError(err.status, err, { userMessage: 'Could retrieve Responsible Officer from nDelius.' })
    }
  }
}
