import createError from 'http-errors'
import RestClient, { RestClientError } from '../data/restClient'
import HmppsAuthService from './hmppsAuthService'
import logger from '../../log'
import { DeliusResponsibleOfficer } from '../models/delius/deliusResponsibleOfficer'
import { RamDeliusUser } from '../models/delius/deliusUser'

export default class RamDeliusApiService {
  constructor(private readonly hmppsAuthService: HmppsAuthService, private readonly restClient: RestClient) {}

  async getUserByUsername(username: string): Promise<RamDeliusUser> {
    const token = await this.hmppsAuthService.getApiClientToken()
    return (await this.restClient.get({ path: `users/${username}/details`, token })) as RamDeliusUser
  }

  async getResponsibleOfficer(crn: string): Promise<DeliusResponsibleOfficer | null> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ crn }, 'getting offender managers for service user')
    try {
      const deliusResponsibleOfficer = (await this.restClient.get({
        path: `/probation-case/${crn}/responsible-officer`,
        token,
      })) as DeliusResponsibleOfficer

      return deliusResponsibleOfficer || null
    } catch (err) {
      const restClientError = err as RestClientError
      throw createError(restClientError.status || 500, restClientError, {
        userMessage: 'Could not retrieve Responsible Officer from nDelius.',
      })
    }
  }
}
