import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'
import { SanitisedError } from '../sanitisedError'
import { DeliusServiceUser } from './communityApiService'
import CalendarDay from '../utils/calendarDay'

export type InterventionsServiceError = SanitisedError & { validationErrors?: InterventionsServiceValidationError[] }

export interface InterventionsServiceValidationError {
  field: string
  error: string
}

type WithNullableValues<T> = { [K in keyof T]: T[K] | null }

export interface ReferralFields {
  createdAt: string
  completionDeadline: string
  serviceProvider: ServiceProvider
  serviceCategoryId: string
  complexityLevelId: string
  furtherInformation: string
  relevantSentenceId: number
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
  serviceUser: ServiceUser
}

export interface SentReferral {
  id: string
  sentAt: string
  referenceNumber: string
  referral: ReferralFields
  sentBy: AuthUser
  assignedTo: AuthUser | null
  actionPlanId: string | null
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
  crn: string
  title: string | null
  firstName: string | null
  lastName: string | null
  dateOfBirth: string | null
  gender: string | null
  ethnicity: string | null
  preferredLanguage: string | null
  religionOrBelief: string | null
  disabilities: string[] | null
}

export interface ServiceProvider {
  name: string
}

export interface AuthUser {
  username: string
  userId: string
  authSource: string
}

export interface Intervention {
  id: string
  title: string
  description: string
  npsRegion: NPSRegion | null
  pccRegions: PCCRegion[]
  serviceCategory: ServiceCategory
  serviceProvider: ServiceProvider
  eligibility: Eligibility
}

export interface PCCRegion {
  id: string
  name: string
}

export interface NPSRegion {
  id: string
  name: string
}

export interface Eligibility {
  minimumAge: number
  maximumAge: number | null
  allowsFemale: boolean
  allowsMale: boolean
}

export interface InterventionsFilterParams {
  allowsMale?: boolean
  allowsFemale?: boolean
  pccRegionIds?: string[]
  maximumAge?: number
}

export interface ActionPlan {
  id: string
  referralId: string
  numberOfSessions: number | null
  activities: Activity[]
  submittedBy: AuthUser | null
  submittedAt: string | null
}

export interface Activity {
  id: string
  desiredOutcome: DesiredOutcome
  description: string
  createdAt: string
}

interface UpdateActivityParams {
  description: string
  desiredOutcomeId: string
}

export interface UpdateDraftActionPlanParams {
  newActivity?: UpdateActivityParams
  numberOfSessions?: number
}

export interface ActionPlanAppointment {
  sessionNumber: number
  appointmentTime: string | null
  durationInMinutes: number | null
  sessionFeedback: {
    attendance: AppointmentAttendance
    behaviour: AppointmentBehaviour
    submitted: boolean
  }
}

export interface ActionPlanAppointmentUpdate {
  appointmentTime: string | null
  durationInMinutes: number | null
}

export type Attended = 'yes' | 'no' | 'late' | null

export interface AppointmentAttendance {
  attended: Attended
  additionalAttendanceInformation: string | null
}

export interface AppointmentBehaviour {
  behaviourDescription: string | null
  notifyProbationPractitioner: boolean | null
}

export default class InterventionsService {
  constructor(private readonly config: ApiConfig) {}

  private createRestClient(token: string): RestClient {
    return new RestClient('Interventions Service API Client', this.config, token)
  }

  private createServiceError(error: unknown): InterventionsServiceError {
    // TODO IC-620 validate this data properly
    const sanitisedError = error as SanitisedError

    const bodyObject = sanitisedError.data as Record<string, unknown>
    if ('validationErrors' in bodyObject) {
      return {
        ...sanitisedError,
        validationErrors: bodyObject.validationErrors as InterventionsServiceValidationError[],
      }
    }

    return sanitisedError
  }

  serializeDeliusServiceUser(deliusServiceUser: DeliusServiceUser | null): ServiceUser {
    if (!deliusServiceUser) {
      return {} as ServiceUser
    }

    const currentDisabilities = deliusServiceUser.offenderProfile?.disabilities
      ? deliusServiceUser.offenderProfile.disabilities
          .filter(disability => {
            const today = new Date().toString()
            return disability.endDate === '' || Date.parse(disability.endDate) >= Date.parse(today)
          })
          .map(disability => disability.disabilityType.description)
      : null

    const iso8601DateOfBirth = deliusServiceUser.dateOfBirth
      ? CalendarDay.parseIso8601Date(deliusServiceUser.dateOfBirth)?.iso8601 || null
      : null

    return {
      crn: deliusServiceUser.otherIds.crn,
      title: deliusServiceUser.title || null,
      firstName: deliusServiceUser.firstName || null,
      lastName: deliusServiceUser.surname || null,
      dateOfBirth: iso8601DateOfBirth || null,
      gender: deliusServiceUser.gender || null,
      ethnicity: deliusServiceUser.offenderProfile?.ethnicity || null,
      preferredLanguage: deliusServiceUser.offenderProfile?.offenderLanguages?.primaryLanguage || null,
      religionOrBelief: deliusServiceUser.offenderProfile?.religion || null,
      disabilities: currentDisabilities,
    }
  }

  async getDraftReferral(token: string, id: string): Promise<DraftReferral> {
    logger.info({ id }, 'Getting draft referral')

    const restClient = this.createRestClient(token)

    try {
      return (await restClient.get({
        path: `/draft-referral/${id}`,
        headers: { Accept: 'application/json' },
      })) as DraftReferral
    } catch (e) {
      throw this.createServiceError(e)
    }
  }

  async createDraftReferral(token: string, crn: string, interventionId: string): Promise<DraftReferral> {
    const restClient = this.createRestClient(token)

    try {
      return (await restClient.post({
        path: `/draft-referral`,
        headers: { Accept: 'application/json' },
        data: { serviceUserCrn: crn, interventionId },
      })) as DraftReferral
    } catch (e) {
      throw this.createServiceError(e)
    }
  }

  async patchDraftReferral(token: string, id: string, patch: Partial<DraftReferral>): Promise<DraftReferral> {
    const restClient = this.createRestClient(token)

    try {
      return (await restClient.patch({
        path: `/draft-referral/${id}`,
        headers: { Accept: 'application/json' },
        data: patch,
      })) as DraftReferral
    } catch (e) {
      throw this.createServiceError(e)
    }
  }

  async getServiceCategory(token: string, id: string): Promise<ServiceCategory> {
    const restClient = this.createRestClient(token)

    try {
      return (await restClient.get({
        path: `/service-category/${id}`,
        headers: { Accept: 'application/json' },
      })) as ServiceCategory
    } catch (e) {
      throw this.createServiceError(e)
    }
  }

  async getDraftReferralsForUser(token: string, userId: string): Promise<DraftReferral[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: '/draft-referrals',
      query: `userID=${userId}`,
      headers: { Accept: 'application/json' },
    })) as DraftReferral[]
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

  async getSentReferrals(token: string): Promise<SentReferral[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referrals`,
      headers: { Accept: 'application/json' },
    })) as SentReferral[]
  }

  async assignSentReferral(token: string, id: string, assignee: AuthUser): Promise<SentReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/sent-referral/${id}/assign`,
      data: { assignedTo: assignee },
      headers: { Accept: 'application/json' },
    })) as SentReferral
  }

  async getInterventions(token: string, filter: InterventionsFilterParams): Promise<Intervention[]> {
    const restClient = this.createRestClient(token)

    const filterQuery: Record<string, unknown> = { ...filter }

    if (filter.pccRegionIds !== undefined) {
      filterQuery.pccRegionIds = filter.pccRegionIds.join(',')
    }

    return (await restClient.get({
      path: '/interventions',
      headers: { Accept: 'application/json' },
      query: filterQuery,
    })) as Intervention[]
  }

  async getIntervention(token: string, id: string): Promise<Intervention> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/intervention/${id}`,
      headers: { Accept: 'application/json' },
    })) as Intervention
  }

  async getPccRegions(token: string): Promise<PCCRegion[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/pcc-regions`,
      headers: { Accept: 'application/json' },
    })) as PCCRegion[]
  }

  async createDraftActionPlan(token: string, referralId: string): Promise<ActionPlan> {
    const restClient = this.createRestClient(token)

    try {
      return (await restClient.post({
        path: '/draft-action-plan',
        headers: { Accept: 'application/json' },
        data: { referralId },
      })) as ActionPlan
    } catch (e) {
      throw this.createServiceError(e)
    }
  }

  async getActionPlan(token: string, id: string): Promise<ActionPlan> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/action-plan/${id}`,
      headers: { Accept: 'application/json' },
    })) as ActionPlan
  }

  async updateDraftActionPlan(
    token: string,
    id: string,
    patch: Partial<UpdateDraftActionPlanParams>
  ): Promise<ActionPlan> {
    const restClient = this.createRestClient(token)

    try {
      return (await restClient.patch({
        path: `/draft-action-plan/${id}`,
        headers: { Accept: 'application/json' },
        data: patch,
      })) as ActionPlan
    } catch (e) {
      throw this.createServiceError(e)
    }
  }

  async submitActionPlan(token: string, id: string): Promise<ActionPlan> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/draft-action-plan/${id}/submit`,
      headers: { Accept: 'application/json' },
    })) as ActionPlan
  }

  async getActionPlanAppointments(token: string, actionPlanId: string): Promise<ActionPlanAppointment[]> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/action-plan/${actionPlanId}/appointments`,
      headers: { Accept: 'application/json' },
    })) as ActionPlanAppointment[]
  }

  async getActionPlanAppointment(token: string, actionPlanId: string, session: number): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/action-plan/${actionPlanId}/appointments/${session}`,
      headers: { Accept: 'application/json' },
    })) as ActionPlanAppointment
  }

  async getSubsequentActionPlanAppointment(
    token: string,
    actionPlan: ActionPlan,
    currentAppointment: ActionPlanAppointment
  ): Promise<ActionPlanAppointment | null> {
    const isFinalAppointment =
      actionPlan.numberOfSessions && actionPlan.numberOfSessions === currentAppointment.sessionNumber

    if (isFinalAppointment) {
      return null
    }

    return (await this.getActionPlanAppointment(
      token,
      actionPlan.id,
      currentAppointment.sessionNumber + 1
    )) as ActionPlanAppointment
  }

  async updateActionPlanAppointment(
    token: string,
    actionPlanId: string,
    sessionNumber: number,
    appointmentUpdate: Partial<ActionPlanAppointmentUpdate>
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)
    return (await restClient.patch({
      path: `/action-plan/${actionPlanId}/appointment/${sessionNumber}`,
      headers: { Accept: 'application/json' },
      data: { ...appointmentUpdate },
    })) as ActionPlanAppointment
  }

  async recordAppointmentAttendance(
    token: string,
    actionPlanId: string,
    sessionNumber: number,
    appointmentAttendanceUpdate: Partial<AppointmentAttendance>
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/action-plan/${actionPlanId}/appointment/${sessionNumber}/record-attendance`,
      headers: { Accept: 'application/json' },
      data: appointmentAttendanceUpdate,
    })) as ActionPlanAppointment
  }

  async recordAppointmentBehaviour(
    token: string,
    actionPlanId: string,
    sessionNumber: number,
    appointmentBehaviourUpdate: Partial<AppointmentBehaviour>
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/action-plan/${actionPlanId}/appointment/${sessionNumber}/record-behaviour`,
      headers: { Accept: 'application/json' },
      data: appointmentBehaviourUpdate,
    })) as ActionPlanAppointment
  }

  async submitSessionFeedback(
    token: string,
    actionPlanId: string,
    sessionNumber: number
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/action-plan/${actionPlanId}/appointment/${sessionNumber}/submit`,
      headers: { Accept: 'application/json' },
    })) as ActionPlanAppointment
  }
}
