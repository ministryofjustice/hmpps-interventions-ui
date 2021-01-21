import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../log'

export interface DeliusUser {
  userId: string
  username: string
  firstName: string
  surname: string
  email: string
  enabled: boolean
  roles: Array<DeliusRole>
}

export interface DeliusServiceUser {
  offenderId: string
  firstName: string
  surname: string
  dateOfBirth: string
}

interface DeliusRole {
  name: string
}

export default class CommunityApiService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private restClient(token: string): RestClient {
    return new RestClient('Community API Client', config.apis.communityApi, token)
  }

  async getUserByUsername(username: string): Promise<DeliusUser> {
    const token = await this.hmppsAuthClient.getApiClientToken()

    logger.info(`getting user details for username ${username}`)
    return (await this.restClient(token).get({ path: `/secure/users/${username}/details` })) as DeliusUser
  }

  async getServiceUserByCRN(crn: string): Promise<DeliusServiceUser> {
    const token = await this.hmppsAuthClient.getApiClientToken()
    logger.info(`getting details for offender with crn ${crn}`)
    return (await this.restClient(token).get({ path: `/secure/offenders/crn/${crn}` })) as DeliusServiceUser
  }
}
