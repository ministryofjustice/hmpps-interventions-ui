import RestClient from '../data/restClient'
import HmppsAuthService from './hmppsAuthService'
import logger from '../../log'
import { SupplementaryRiskInformation } from '../models/assessRisksAndNeeds/supplementaryRiskInformation'

export default class AssessRisksAndNeedsService {
  constructor(private readonly hmppsAuthService: HmppsAuthService, private readonly restClient: RestClient) {}

  async getSupplementaryRiskInformation(riskId: string): Promise<SupplementaryRiskInformation> {
    const token = await this.hmppsAuthService.getApiClientToken()

    logger.info({ riskId }, 'getting supplementary risk information')
    return (await this.restClient.get({
      path: `/risks/supplementary/${riskId}`,
      token,
    })) as SupplementaryRiskInformation
  }
}
