import RestClient from '../data/restClient'
import HmppsAuthService from './hmppsAuthService'
import logger from '../../log'
import { SupplementaryRiskInformation } from '../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../models/assessRisksAndNeeds/riskSummary'

export default class AssessRisksAndNeedsService {
  constructor(private readonly hmppsAuthService: HmppsAuthService, private readonly restClient: RestClient) {}

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

  async getRiskSummaryScores(crn: string, token: string): Promise<RiskSummary> {
    logger.info({ crn }, 'getting risk summary information')
    return (await this.restClient.get({
      path: `/risks/crn/${crn}/summary`,
      token,
    })) as RiskSummary
  }
}
