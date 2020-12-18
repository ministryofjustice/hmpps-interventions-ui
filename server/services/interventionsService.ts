import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'

export interface DraftReferral {
  id: string
  createdAt: string
  completionDeadline: string | null
  serviceCategoryId: string | null
  complexityLevelId: string | null
  furtherInformation: string | null
  desiredOutcomesIds: string[] | null
  additionalNeedsInformation: string | null
  accessibilityNeeds: string | null
  needsInterpreter: boolean | null
  interpreterLanguage: string | null
  hasAdditionalResponsibilities: boolean | null
  whenUnavailable: string | null
  serviceUser: ServiceUser | null
  additionalRiskInformation: string | null
  usingRarDays: boolean | null
  maximumRarDays: number | null
}

export interface ServiceCategory {
  id: string
  name: string
  complexityLevels: ComplexityLevel[]
  desiredOutcomes: DesiredOutcome[]
}

export interface ComplexityLevel {
  id: string
  title: string
  description: string
}

export interface DesiredOutcome {
  id: string
  description: string
}

export interface ServiceUser {
  firstName: string | null
}

export default class InterventionsService {
  constructor(private readonly config: ApiConfig) {}

  private createRestClient(token: string): RestClient {
    return new RestClient('Interventions Service API Client', this.config, token)
  }

  async getDraftReferral(token: string, id: string): Promise<DraftReferral> {
    logger.info(`Getting draft referral with id ${id}`)

    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/draft-referral/${id}`,
      headers: { Accept: 'application/json' },
    })) as DraftReferral
  }

  async createDraftReferral(token: string): Promise<DraftReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/draft-referral`,
      headers: { Accept: 'application/json' },
    })) as DraftReferral
  }

  async patchDraftReferral(token: string, id: string, patch: Partial<DraftReferral>): Promise<DraftReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.patch({
      path: `/draft-referral/${id}`,
      headers: { Accept: 'application/json' },
      data: patch,
    })) as DraftReferral
  }

  async getServiceCategory(token: string, serviceCategoryId: string): Promise<ServiceCategory> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/service-category/${serviceCategoryId}`,
      headers: { Accept: 'application/json' },
    })) as ServiceCategory
  }

  async getDraftReferralsForUser(token: string, userId: string): Promise<DraftReferral[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: '/draft-referrals',
      query: `userID=${userId}`,
      headers: { Accept: 'application/json' },
    })) as DraftReferral[]
  }
}
