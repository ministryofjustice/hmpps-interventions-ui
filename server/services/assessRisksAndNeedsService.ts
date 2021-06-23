import createError from 'http-errors'
import RestClient from '../data/restClient'
import HmppsAuthService from './hmppsAuthService'
import logger from '../../log'
import { SupplementaryRiskInformation } from '../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../models/assessRisksAndNeeds/riskSummary'

export default class AssessRisksAndNeedsService {
  constructor(
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly restClient: RestClient,
    private readonly riskSummaryEnabled: boolean
  ) {}

  async getSupplementaryRiskInformation(
    riskId: string,
    token: string | null = null
  ): Promise<SupplementaryRiskInformation> {
    logger.info({ riskId }, 'getting supplementary risk information')
    return (await this.restClient.get({
      path: `/risks/supplementary/${riskId}`,
      token: token || (await this.hmppsAuthService.getApiClientToken()),
    })) as SupplementaryRiskInformation
  }

  async getRiskSummary(crn: string, token: string): Promise<RiskSummary | null> {
    if (!this.riskSummaryEnabled) {
      logger.info('not getting risk summary information; disabled')
      return null
    }

    logger.info({ crn }, 'getting risk summary information')
    try {
      return (await this.restClient.get({
        path: `/risks/crn/${crn}/summary`,
        token,
      })) as RiskSummary
    } catch (err) {
      throw createError(err.status, err, { userMessage: 'Could not get service user risk scores from OASys.' })
    }
  }
}
