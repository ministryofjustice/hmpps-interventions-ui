import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'

type WithNullableValues<T> = { [K in keyof T]: T[K] | null }

export interface ReferralFields {
  completionDeadline: string
  serviceProviderId: string
  serviceCategoryId: string
  complexityLevelId: string
  furtherInformation: string
  desiredOutcomesIds: string[]
  additionalNeedsInformation: string
  accessibilityNeeds: string
  needsInterpreter: boolean
  interpreterLanguage: string | null
  hasAdditionalResponsibilities: boolean
  whenUnavailable: string | null
  serviceUser: ServiceUser
  additionalRiskInformation: string
  usingRarDays: boolean
  maximumRarDays: number | null
}

export interface DraftReferral extends WithNullableValues<ReferralFields> {
  id: string
  createdAt: string
}

export interface SentReferral {
  id: string
  createdAt: string
  referenceNumber: string
  referral: ReferralFields
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

export interface ServiceProvider {
  id: string
  name: string
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

  async getServiceCategory(token: string, id: string): Promise<ServiceCategory> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/service-category/${id}`,
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

  async getServiceProvider(token: string, id: string): Promise<ServiceProvider> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/service-provider/${id}`,
      headers: { Accept: 'application/json' },
    })) as ServiceProvider
  }

  async sendDraftReferral(token: string, id: string): Promise<SentReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/draft-referral/${id}/send`,
      headers: { Accept: 'application/json' },
    })) as SentReferral
  }

  async getSentReferral(token: string, id: string): Promise<SentReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referral/${id}`,
      headers: { Accept: 'application/json' },
    })) as SentReferral
  }
}
