import createError from 'http-errors'
import RestClient from '../data/restClient'
import logger from '../../log'
import { SupplementaryRiskInformation } from '../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../models/assessRisksAndNeeds/riskSummary'

export default class AssessRisksAndNeedsService {
  constructor(private readonly restClient: RestClient, private readonly riskSummaryEnabled: boolean) {}

  async getSupplementaryRiskInformation(riskId: string, token: string): Promise<SupplementaryRiskInformation> {
    logger.info({ riskId }, 'getting supplementary risk information')
    return (await this.restClient.get({
      path: `/risks/supplementary/${riskId}`,
      token,
    })) as SupplementaryRiskInformation
  }

  async getRiskSummary(crn: string, token: string): Promise<RiskSummary | null> {
    // if (!this.riskSummaryEnabled) {
    //   logger.info('not getting risk summary information; disabled')
    //   return null
    // }

    logger.info({ crn }, 'getting risk summary information')
    try {
      return (await this.restClient.get({
        path: `/risks/crn/${crn}`,
        token,
      })) as RiskSummary
    } catch (err) {
      if (err.status === 404) {
        // missing (or out of date) risk information is expected and does not constitute an error
        return null
      }

      throw createError(err.status, err, { userMessage: "Could not get service user's risk scores from OASys." })
    }
  }
}
