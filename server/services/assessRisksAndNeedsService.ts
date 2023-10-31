import createError from 'http-errors'
import RestClient, { RestClientError } from '../data/restClient'
import logger from '../../log'
import { SupplementaryRiskInformation } from '../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../models/assessRisksAndNeeds/riskSummary'

export type AssessRisksAndNeedsServiceError = RestClientError

export default class AssessRisksAndNeedsService {
  constructor(private readonly restClient: RestClient) {}

  async getSupplementaryRiskInformation(riskId: string, token: string): Promise<SupplementaryRiskInformation> {
    logger.info({ riskId }, 'getting supplementary risk information')
    return (await this.restClient.get({
      path: `/risks/supplementary/${riskId}`,
      token,
    })) as SupplementaryRiskInformation
  }

  async getRiskSummary(crn: string, token: string): Promise<RiskSummary | null> {
    logger.info({ crn }, 'getting risk summary information')
    try {
      return (await this.restClient.get({
        path: `/risks/crn/${crn}`,
        token,
      })) as RiskSummary
    } catch (err) {
      const restClientError = err as RestClientError

      if (restClientError.status === 403 || restClientError.status === 404) {
        // risk throws 403 when the user is not authorised and this is expected and does not constitute an error
        // missing (or out of date) risk information is expected and does not constitute an error
        return null
      }

      throw createError(restClientError.status || 500, restClientError, {
        userMessage: "Could not get service user's risk scores from OASys.",
      })
    }
  }
}
