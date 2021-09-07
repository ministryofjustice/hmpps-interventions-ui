import RestClient from '../data/restClient'
import logger from '../../log'
import { ApiConfig } from '../config'
import DeliusServiceUser from '../models/delius/deliusServiceUser'
import CalendarDay from '../utils/calendarDay'
import User from '../models/hmppsAuth/user'
import EndOfServiceReport, { AchievementLevel } from '../models/endOfServiceReport'
import ServiceUser from '../models/serviceUser'
import Intervention from '../models/intervention'
import PCCRegion from '../models/pccRegion'
import CancellationReason from '../models/cancellationReason'
import ServiceCategory from '../models/serviceCategory'
import ActionPlan from '../models/actionPlan'
import AppointmentAttendance from '../models/appointmentAttendance'
import AppointmentBehaviour from '../models/appointmentBehaviour'
import DraftReferral from '../models/draftReferral'
import SentReferral from '../models/sentReferral'
import ReferralDesiredOutcomes from '../models/referralDesiredOutcomes'
import ReferralComplexityLevel from '../models/referralComplexityLevel'
import SupplierAssessment from '../models/supplierAssessment'
import ServiceProviderSentReferralSummary from '../models/serviceProviderSentReferralSummary'
import {
  ActionPlanAppointment,
  AppointmentSchedulingDetails,
  InitialAssessmentAppointment,
} from '../models/appointment'
import ApprovedActionPlanSummary from '../models/approvedActionPlanSummary'
import { Page } from '../models/pagination'
import { CaseNote } from '../models/caseNote'

export interface InterventionsServiceValidationError {
  field: string
  error: string
}

export interface InterventionsFilterParams {
  allowsMale?: boolean
  allowsFemale?: boolean
  pccRegionIds?: string[]
  maximumAge?: number
}

export interface UpdateActivityParams {
  description: string
}

export interface UpdateDraftActionPlanParams {
  newActivity?: UpdateActivityParams
  numberOfSessions?: number
}

export interface CreateEndOfServiceReportOutcome {
  desiredOutcomeId: string
  achievementLevel: AchievementLevel
  progressionComments: string
  additionalTaskComments: string
}

export interface UpdateDraftEndOfServiceReportParams {
  furtherInformation: string | null
  outcome: CreateEndOfServiceReportOutcome | null
}

export interface CreateReportDateParams {
  fromIncludingDate: CalendarDay
  toIncludingDate: CalendarDay
}

// Pagination parameters for resources that use spring pageable
export interface PaginationParams {
  // Page number to retrieve -- starts from 1
  page?: number
  // Number of elements in a page
  size?: number
  // Sort by property, defaults to ascending order. If descending is required then add ',DESC' at the end of the property you want sorted i.e. ['$PROPERTY_NAME,DESC']
  sort?: string[]
}

export interface CreateCaseNoteParams {
  referralId: string
  subject: string
  body: string
}

export default class InterventionsService {
  constructor(private readonly config: ApiConfig) {}

  private createRestClient(token: string): RestClient {
    return new RestClient('Interventions Service API Client', this.config, token)
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
    return (await restClient.get({
      path: `/draft-referral/${id}`,
      headers: { Accept: 'application/json' },
    })) as DraftReferral
  }

  async createDraftReferral(token: string, crn: string, interventionId: string): Promise<DraftReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/draft-referral`,
      headers: { Accept: 'application/json' },
      data: { serviceUserCrn: crn, interventionId },
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

  async setDesiredOutcomesForServiceCategory(
    token: string,
    referralId: string,
    desiredOutcomes: Partial<ReferralDesiredOutcomes>
  ): Promise<DraftReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.patch({
      path: `/draft-referral/${referralId}/desired-outcomes`,
      headers: { Accept: 'application/json' },
      data: desiredOutcomes,
    })) as DraftReferral
  }

  async setComplexityLevelForServiceCategory(
    token: string,
    referralId: string,
    complexityLevel: Partial<ReferralComplexityLevel>
  ): Promise<DraftReferral> {
    const restClient = this.createRestClient(token)

    return (await restClient.patch({
      path: `/draft-referral/${referralId}/complexity-level`,
      headers: { Accept: 'application/json' },
      data: complexityLevel,
    })) as DraftReferral
  }

  async getServiceCategory(token: string, id: string): Promise<ServiceCategory> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/service-category/${id}`,
      headers: { Accept: 'application/json' },
    })) as ServiceCategory
  }

  async getDraftReferralsForUserToken(token: string): Promise<DraftReferral[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: '/draft-referrals',
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

  async getSentReferralsForUserToken(token: string): Promise<SentReferral[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referrals`,
      headers: { Accept: 'application/json' },
    })) as SentReferral[]
  }

  async getServiceProviderSentReferralsSummaryForUserToken(
    token: string
  ): Promise<ServiceProviderSentReferralSummary[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referrals/summary/service-provider`,
      headers: { Accept: 'application/json' },
    })) as ServiceProviderSentReferralSummary[]
  }

  async assignSentReferral(token: string, id: string, assignee: User): Promise<SentReferral> {
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

  async createDraftActionPlan(
    token: string,
    referralId: string,
    numberOfSessions?: number,
    activities?: UpdateActivityParams[]
  ): Promise<ActionPlan> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: '/draft-action-plan',
      headers: { Accept: 'application/json' },
      data: {
        referralId,
        numberOfSessions,
        activities,
      },
    })) as ActionPlan
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

    return (await restClient.patch({
      path: `/draft-action-plan/${id}`,
      headers: { Accept: 'application/json' },
      data: patch,
    })) as ActionPlan
  }

  async updateActionPlanActivity(
    token: string,
    actionPlanId: string,
    activityId: string,
    description: string
  ): Promise<ActionPlan> {
    const restClient = this.createRestClient(token)
    return (await restClient.patch({
      path: `/action-plan/${actionPlanId}/activities/${activityId}`,
      headers: { Accept: 'application/json' },
      data: { description },
    })) as ActionPlan
  }

  async submitActionPlan(token: string, id: string): Promise<ActionPlan> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/draft-action-plan/${id}/submit`,
      headers: { Accept: 'application/json' },
    })) as ActionPlan
  }

  async getApprovedActionPlanSummaries(token: string, referralId: string): Promise<ApprovedActionPlanSummary[]> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/sent-referral/${referralId}/approved-action-plans`,
      headers: { Accept: 'application/json' },
    })) as ApprovedActionPlanSummary[]
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
    appointmentUpdate: AppointmentSchedulingDetails
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)
    return (await restClient.patch({
      path: `/action-plan/${actionPlanId}/appointment/${sessionNumber}`,
      headers: { Accept: 'application/json' },
      data: { ...appointmentUpdate },
    })) as ActionPlanAppointment
  }

  async recordActionPlanAppointmentAttendance(
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

  async recordActionPlanAppointmentBehavior(
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

  async submitActionPlanSessionFeedback(
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

  async createDraftEndOfServiceReport(token: string, referralId: string): Promise<EndOfServiceReport> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: '/draft-end-of-service-report',
      headers: { Accept: 'application/json' },
      data: { referralId },
    })) as EndOfServiceReport
  }

  async getEndOfServiceReport(token: string, id: string): Promise<EndOfServiceReport> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/end-of-service-report/${id}`,
      headers: { Accept: 'application/json' },
    })) as EndOfServiceReport
  }

  async updateDraftEndOfServiceReport(
    token: string,
    id: string,
    patch: Partial<UpdateDraftEndOfServiceReportParams>
  ): Promise<EndOfServiceReport> {
    const restClient = this.createRestClient(token)

    return (await restClient.patch({
      path: `/draft-end-of-service-report/${id}`,
      headers: { Accept: 'application/json' },
      data: patch,
    })) as EndOfServiceReport
  }

  async submitEndOfServiceReport(token: string, id: string): Promise<EndOfServiceReport> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/draft-end-of-service-report/${id}/submit`,
      headers: { Accept: 'application/json' },
    })) as EndOfServiceReport
  }

  async endReferral(
    token: string,
    referralId: string,
    reasonCode: string,
    comments: string | null
  ): Promise<SentReferral> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${referralId}/end`,
      data: {
        reasonCode,
        comments,
      },
      headers: { Accept: 'application/json' },
    })) as SentReferral
  }

  async getReferralCancellationReasons(token: string): Promise<CancellationReason[]> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: '/referral-cancellation-reasons',
      headers: { Accept: 'application/json' },
    })) as CancellationReason[]
  }

  async approveActionPlan(token: string, actionPlanId: string): Promise<void> {
    const restClient = this.createRestClient(token)
    await restClient.post({
      path: `/action-plan/${actionPlanId}/approve`,
      headers: { Accept: 'application/json' },
    })
  }

  async getSupplierAssessment(token: string, referralId: string): Promise<SupplierAssessment> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/sent-referral/${referralId}/supplier-assessment`,
      headers: { Accept: 'application/json' },
    })) as SupplierAssessment
  }

  async scheduleSupplierAssessmentAppointment(
    token: string,
    supplierAssessmentId: string,
    appointmentUpdate: Partial<AppointmentSchedulingDetails>
  ): Promise<InitialAssessmentAppointment> {
    const restClient = this.createRestClient(token)
    return (await restClient.put({
      path: `/supplier-assessment/${supplierAssessmentId}/schedule-appointment`,
      headers: { Accept: 'application/json' },
      data: { ...appointmentUpdate },
    })) as InitialAssessmentAppointment
  }

  async recordSupplierAssessmentAppointmentAttendance(
    token: string,
    referralId: string,
    appointmentAttendanceUpdate: Partial<AppointmentAttendance>
  ): Promise<InitialAssessmentAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.put({
      path: `/referral/${referralId}/supplier-assessment/record-attendance`,
      headers: { Accept: 'application/json' },
      data: appointmentAttendanceUpdate,
    })) as InitialAssessmentAppointment
  }

  async recordSupplierAssessmentAppointmentBehaviour(
    token: string,
    referralId: string,
    appointmentBehaviourUpdate: Partial<AppointmentBehaviour>
  ): Promise<InitialAssessmentAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.put({
      path: `/referral/${referralId}/supplier-assessment/record-behaviour`,
      headers: { Accept: 'application/json' },
      data: appointmentBehaviourUpdate,
    })) as InitialAssessmentAppointment
  }

  async submitSupplierAssessmentAppointmentFeedback(
    token: string,
    referralId: string
  ): Promise<InitialAssessmentAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/referral/${referralId}/supplier-assessment/submit-feedback`,
      headers: { Accept: 'application/json' },
    })) as InitialAssessmentAppointment
  }

  private static createReportDatesDTO(params: CreateReportDateParams): Record<string, unknown> {
    return {
      fromDate: params.fromIncludingDate.iso8601,
      toDate: params.toIncludingDate.iso8601,
    }
  }

  async generateServiceProviderPerformanceReport(token: string, reportDates: CreateReportDateParams): Promise<void> {
    const restClient = this.createRestClient(token)

    await restClient.post({
      path: '/reports/service-provider/performance',
      data: InterventionsService.createReportDatesDTO(reportDates),
    })
  }

  async getCaseNotes(token: string, referralId: string, paginationParams: PaginationParams): Promise<Page<CaseNote>> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referral/${referralId}/case-notes`,
      headers: { Accept: 'application/json' },
      query: { ...paginationParams },
    })) as Page<CaseNote>
  }

  async addCaseNotes(token: string, createCaseNoteParam: CreateCaseNoteParams): Promise<CaseNote> {
    const restClient = this.createRestClient(token)
    const createCaseNoteDTO: Record<string, unknown> = {
      referralId: createCaseNoteParam.referralId,
      subject: createCaseNoteParam.subject,
      body: createCaseNoteParam.body,
    }
    return (await restClient.post({
      path: `/case-note`,
      headers: { Accept: 'application/json' },
      data: createCaseNoteDTO,
    })) as CaseNote
  }

  async getCaseNote(token: string, caseNoteId: string): Promise<CaseNote> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/case-note/${caseNoteId}`,
      headers: { Accept: 'application/json' },
    })) as CaseNote
  }
}
