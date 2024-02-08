import logger from '../../log'
import PrisonAndSecuredChildAgency from '../models/prisonAndSecureChildAgency'
import PrisonApiService from './prisonApiService'
import PrisonRegisterService from './prisonRegisterService'

export default class PrisonAndSecuredChildAgencyService {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly prisonApiService: PrisonApiService
  ) {}

  async getPrisonsAndSecureChildAgencies(token: string): Promise<PrisonAndSecuredChildAgency[]> {
    logger.info(`Combining prisons and secure child agencies`)

    const prisons = await this.prisonRegisterService.getPrisons()
    const securedChildAgencies = await this.prisonApiService.getSecureChildrenAgencies(token)

    const prisonsAndSecuredChildAgencies: PrisonAndSecuredChildAgency[] = []

    prisons.forEach(prison =>
      prisonsAndSecuredChildAgencies.push({ id: prison.prisonId, description: prison.prisonName })
    )
    securedChildAgencies.forEach(securedChildAgency =>
      prisonsAndSecuredChildAgencies.push({
        id: securedChildAgency.agencyId,
        description: securedChildAgency.description,
      })
    )

    return prisonsAndSecuredChildAgencies
  }
}
