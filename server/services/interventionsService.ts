import RestClient, { RestClientError } from '../data/restClient'
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
import DraftReferral from '../models/draftReferral'
import SentReferral from '../models/sentReferral'
import SentReferralSummaries from '../models/sentReferralSummaries'
import ReferralDesiredOutcomes, { ReferralDesiredOutcomesUpdate } from '../models/referralDesiredOutcomes'
import { AmendReferralDetailsUpdate } from '../models/referralAccessibilityNeeds'
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
import { DraftOasysRiskInformation } from '../models/draftOasysRiskInformation'
import ReferralDetails, { ReferralDetailsUpdate } from '../models/referralDetails'
import Changelog from '../models/changelog'
import { ReferralAdditionalInformationUpdate } from '../models/referralAdditionalInformation'
import AmendNeedsAndRequirements from '../models/amendNeedsAndRequirements'
import { NeedsAndRequirementsType } from '../models/needsAndRequirementsType'
import ChangelogDetail from '../models/changelogDetail'
import { AmendOtherNeeds } from '../models/OtherNeeds'
import SessionFeedback, { NoSessionReasonType } from '../models/sessionFeedback'
import Prisoner from '../models/prisonerOffenderSearch/prisoner'
import WithdrawalReason from '../models/withdrawalReason'
import { AmendPrisonEstablishmentUpdate } from '../models/referralPrisonEstablishment'
import AmendExpectedReleaseDateUpdate from '../models/referralExpectedReleaseDate'
import { AmendProbationOfficeUpdate } from '../models/referralProbationOffice'
import { AmendProbationPractitionerNameUpdate } from '../models/referralProbationPractitionerName'
import { AmendProbationPractitionerEmailUpdate } from '../models/referralProbationPractitionerEmail'
import { AmendProbationPractitionerPhoneNumberUpdate } from '../models/referralProbationPractitionerPhoneNumber'
import { AmendProbationPractitionerTeamPhoneNumberUpdate } from '../models/referralProbationPractitionerTeamPhoneNumber'

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

export interface GetSentReferralsFilterParams {
  completed?: boolean
  cancelled?: boolean
  unassigned?: boolean
  assignedTo?: string
  search?: string
}

export enum SPDashboardType {
  MyCases = 'MyCases',
  OpenCases = 'OpenCases',
  UnassignedCases = 'UnassignedCases',
  CompletedCases = 'CompletedCases',
  CancelledCases = 'CancelledCases',
}

export type InterventionsServiceError = RestClientError

export interface CreateCaseNoteParams {
  referralId: string
  subject: string
  body: string
}

export type CreateAppointmentSchedulingAndFeedback = AppointmentSchedulingDetails & {
  attendanceFeedback: {
    didSessionHappen: boolean | null
    attended: 'yes' | 'no' | null
    attendanceFailureInformation: string | null
  }
  sessionFeedback: {
    sessionSummary: string | null
    sessionResponse: string | null
    sessionConcerns: string | null
    notifyProbationPractitioner: boolean | null
    late: boolean | null
    lateReason: string | null
    noSessionReasonType: NoSessionReasonType | null
    noSessionReasonPopAcceptable: string | null
    noSessionReasonPopUnacceptable: string | null
    noSessionReasonLogistics: string | null
    // noSessionReasonOther: string | null
  } | null
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

    const currentDisabilities = deliusServiceUser.profile?.disabilities
      ? deliusServiceUser.profile.disabilities.map(disability => disability.type)
      : null

    const iso8601DateOfBirth = deliusServiceUser.dateOfBirth
      ? CalendarDay.parseIso8601Date(deliusServiceUser.dateOfBirth)?.iso8601 || null
      : null

    return {
      crn: deliusServiceUser.crn,
      title: deliusServiceUser.title || null,
      firstName: deliusServiceUser.name.forename || null,
      lastName: deliusServiceUser.name.surname || null,
      dateOfBirth: iso8601DateOfBirth || null,
      gender: deliusServiceUser.gender || null,
      ethnicity: deliusServiceUser.profile?.ethnicity || null,
      preferredLanguage: deliusServiceUser.profile?.primaryLanguage || null,
      religionOrBelief: deliusServiceUser.profile?.religion || null,
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

  async updateDesiredOutcomesForServiceCategory(
    token: string,
    referralId: string,
    serviceCategoryId: string,
    update: Partial<ReferralDesiredOutcomesUpdate>
  ): Promise<null> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/sent-referral/${referralId}/service-category/${serviceCategoryId}/amend-desired-outcomes`,
      headers: { Accept: 'application/json' },
      data: { ...update },
    })) as null
  }

  async updateAccessibilityNeeds(
    token: string,
    referralId: string,
    update: Partial<AmendReferralDetailsUpdate>
  ): Promise<null> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/sent-referral/${referralId}/amend-needs-and-requirements/accessibility-needs`,
      headers: { Accept: 'application/json' },
      data: { ...update },
    })) as null
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

  async amendComplexityLevelForServiceCategory(
    token: string,
    referralId: string,
    serviceCategoryId: string,
    complexityLevel: Partial<ReferralComplexityLevel>
  ): Promise<null> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/sent-referral/${referralId}/service-category/${serviceCategoryId}/amend-complexity-level`,
      headers: { Accept: 'application/json' },
      data: complexityLevel,
    })) as null
  }

  async amendAdditionalInformation(
    token: string,
    referralId: string,
    additionalInformation: Partial<ReferralAdditionalInformationUpdate>
  ): Promise<null> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/sent-referral/${referralId}/amend-needs-and-requirements/identify-needs`,
      headers: { Accept: 'application/json' },
      data: { ...additionalInformation },
    })) as null
  }

  async getServiceCategory(token: string, id: string): Promise<ServiceCategory> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/service-category/${id}`,
      headers: { Accept: 'application/json' },
    })) as ServiceCategory
  }

  async getServiceCategoryByIdAndContractReference(
    token: string,
    id: string,
    contractReference: string
  ): Promise<ServiceCategory> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/service-category/${id}/contract-reference/${contractReference}`,
      headers: { Accept: 'application/json' },
    })) as ServiceCategory
  }

  async getServiceCategories(token: string, serviceCategoryIds: string[]): Promise<ServiceCategory[]> {
    // observation: will generate lots of small calls; however, service categories are practically static
    // it might make sense to preload them at application startup, so that recycling the pods will evict the cache
    return Promise.all(serviceCategoryIds.map(serviceCategoryId => this.getServiceCategory(token, serviceCategoryId)))
  }

  async getChangelog(token: string, referralId: string): Promise<Changelog[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referral/${referralId}/change-log`,
      headers: { Accept: 'application/json' },
    })) as Changelog[]
  }

  async getChangelogDetail(token: string, changeLogId: string): Promise<ChangelogDetail> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/sent-referral/change-log/${changeLogId}`,
      headers: { Accept: 'application/json' },
    })) as ChangelogDetail
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

  async updateSentReferralDetails(token: string, id: string, update: ReferralDetailsUpdate): Promise<ReferralDetails> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/referral-details`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as ReferralDetails
  }

  async updatePrisonEstablishment(token: string, id: string, update: AmendPrisonEstablishmentUpdate): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-prison-establishment`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateProbationPractitionerName(
    token: string,
    id: string,
    update: AmendProbationPractitionerNameUpdate
  ): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-probation-practitioner-name`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateProbationPractitionerEmail(
    token: string,
    id: string,
    update: AmendProbationPractitionerEmailUpdate
  ): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-probation-practitioner-email`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateProbationPractitionerPhoneNumber(
    token: string,
    id: string,
    update: AmendProbationPractitionerPhoneNumberUpdate
  ): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-probation-practitioner-phone-number`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateProbationPractitionerTeamPhoneNumber(
    token: string,
    id: string,
    update: AmendProbationPractitionerTeamPhoneNumberUpdate
  ): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-probation-practitioner-team-phone-number`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateExpectedReleaseDate(token: string, id: string, update: AmendExpectedReleaseDateUpdate): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-expected-release-date`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateEmploymentResponsibilities(token: string, id: string, update: Partial<AmendOtherNeeds>): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-needs-and-requirements/additional-responsibilities`,
      data: { ...update },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateExpectedProbationOffice(
    token: string,
    id: string,
    update: AmendProbationOfficeUpdate,
    preventEmailNotification: boolean | null = null
  ): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-expected-probation-office`,
      data: { ...update, preventEmailNotification },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async updateProbationPractitionerProbationOffice(
    token: string,
    id: string,
    update: AmendProbationOfficeUpdate,
    preventEmailNotification: boolean | null = null
  ): Promise<null> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${id}/amend-pp-probation-office`,
      data: { ...update, preventEmailNotification },
      headers: { Accept: 'application/json' },
    })) as null
  }

  async getSentReferralsForUserToken(
    token: string,
    filterParams: GetSentReferralsFilterParams
  ): Promise<SentReferral[]> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referrals`,
      headers: { Accept: 'application/json' },
      query: { ...filterParams },
    })) as SentReferral[]
  }

  async getSentReferralsForUserTokenPaged(
    token: string,
    filterParams: GetSentReferralsFilterParams,
    paginationParams: PaginationParams
  ): Promise<Page<SentReferralSummaries>> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/sent-referrals/summaries`,
      headers: { Accept: 'application/json' },
      query: { ...filterParams, ...paginationParams },
    })) as Page<SentReferralSummaries>
  }

  async getServiceProviderSentReferralsSummaryForUserToken(
    token: string,
    dashboardType?: SPDashboardType
  ): Promise<ServiceProviderSentReferralSummary[]> {
    const restClient = this.createRestClient(token)
    const query = dashboardType ? { dashboardType } : undefined
    return (await restClient.get({
      path: `/sent-referrals/summary/service-provider`,
      query,
      headers: { Accept: 'application/json' },
    })) as ServiceProviderSentReferralSummary[]
  }

  async getServiceProviderSentReferralsSummaryForUserTokenWithSearchText(
    token: string,
    searchText: string,
    dashboardType?: SPDashboardType
  ): Promise<ServiceProviderSentReferralSummary[]> {
    const restClient = this.createRestClient(token)
    const query = dashboardType ? { dashboardType } : undefined
    return (await restClient.get({
      path: `/sent-referrals/summaries`,
      query: { ...query, searchText },
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

  async getMyInterventions(token: string): Promise<Intervention[]> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: '/my-interventions',
      headers: { Accept: 'application/json' },
    })) as Intervention[]
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

  async getPrisonerDetails(token: string, crn: string): Promise<Prisoner> {
    const restClient = this.createRestClient(token)

    return (await restClient.get({
      path: `/intervention/prisoner/details/${crn}`,
      headers: { Accept: 'application/json' },
    })) as Prisoner
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
    appointmentUpdate: AppointmentSchedulingDetails | CreateAppointmentSchedulingAndFeedback
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
    referralId: string,
    appointmentId: string,

    appointmentAttendanceUpdate: Partial<AppointmentAttendance>
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.put({
      path: `/referral/${referralId}/delivery-session-appointments/${appointmentId}/attendance`,

      headers: { Accept: 'application/json' },
      data: appointmentAttendanceUpdate,
    })) as ActionPlanAppointment
  }

  async recordActionPlanAppointmentSessionFeedback(
    token: string,
    referralId: string,
    appointmentId: string,
    sessionFeedbackUpdate: Partial<SessionFeedback>
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.put({
      path: `/referral/${referralId}/delivery-session-appointments/${appointmentId}/session-feedback`,
      headers: { Accept: 'application/json' },
      data: sessionFeedbackUpdate,
    })) as ActionPlanAppointment
  }

  async submitActionPlanSessionFeedback(
    token: string,
    referralId: string,
    appointmentId: string
  ): Promise<ActionPlanAppointment> {
    const restClient = this.createRestClient(token)

    return (await restClient.post({
      path: `/referral/${referralId}/delivery-session-appointments/${appointmentId}/submit-feedback`,
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

  async withdrawReferral(
    token: string,
    referralId: string,
    code: string,
    comments: string | null,
    withdrawalState: string
  ): Promise<SentReferral> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/sent-referral/${referralId}/withdraw-referral`,
      data: {
        code,
        comments,
        withdrawalState,
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

  async getReferralWithdrawalReasons(token: string): Promise<WithdrawalReason[]> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: '/referral-withdrawal-reasons',
      headers: { Accept: 'application/json' },
    })) as WithdrawalReason[]
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

  async scheduleAndSubmitSupplierAssessmentAppointmentWithFeedback(
    token: string,
    supplierAssessmentId: string,
    appointmentUpdate: CreateAppointmentSchedulingAndFeedback
  ): Promise<InitialAssessmentAppointment> {
    const restClient = this.createRestClient(token)
    return (await restClient.put({
      path: `/supplier-assessment/${supplierAssessmentId}/schedule-appointment`,
      headers: { Accept: 'application/json' },
      data: { ...appointmentUpdate },
    })) as InitialAssessmentAppointment
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

  async recordSupplierAssessmentAppointmentSessionFeedback(
    token: string,
    referralId: string,
    sessionFeedbackUpdate: Partial<SessionFeedback>
  ): Promise<InitialAssessmentAppointment> {
    const restClient = this.createRestClient(token)
    return (await restClient.put({
      path: `/referral/${referralId}/supplier-assessment/record-session-feedback`,
      headers: { Accept: 'application/json' },
      data: sessionFeedbackUpdate,
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

  async addCaseNotes(token: string, caseNote: Partial<CaseNote>): Promise<CaseNote> {
    const restClient = this.createRestClient(token)
    return (await restClient.post({
      path: `/case-note`,
      headers: { Accept: 'application/json' },
      data: caseNote,
    })) as CaseNote
  }

  async getCaseNote(token: string, caseNoteId: string): Promise<CaseNote> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/case-note/${caseNoteId}`,
      headers: { Accept: 'application/json' },
    })) as CaseNote
  }

  async updateDraftOasysRiskInformation(
    token: string,
    referralId: string,
    draftOasysRiskInformation: DraftOasysRiskInformation
  ): Promise<DraftOasysRiskInformation> {
    const restClient = this.createRestClient(token)
    return (await restClient.patch({
      path: `/draft-referral/${referralId}/oasys-risk-information`,
      headers: { Accept: 'application/json' },
      data: { ...draftOasysRiskInformation },
    })) as DraftOasysRiskInformation
  }

  async getDraftOasysRiskInformation(token: string, referralId: string): Promise<DraftOasysRiskInformation> {
    const restClient = this.createRestClient(token)
    return (await restClient.get({
      path: `/draft-referral/${referralId}/oasys-risk-information`,
      headers: { Accept: 'application/json' },
    })) as DraftOasysRiskInformation
  }

  async updateNeedsAndRequirments(
    token: string,
    referral: SentReferral,
    type: NeedsAndRequirementsType,
    amendNeedsAndRequirement: AmendNeedsAndRequirements
  ): Promise<void> {
    const restClient = this.createRestClient(token)
    await restClient.post({
      path: `/sent-referral/${referral.id}/amend-needs-and-requirements/${type}`,
      headers: { Accept: 'application/json' },
      data: { ...amendNeedsAndRequirement },
    })
  }

  async addNewUserToIntervention(token: string): Promise<void> {
    const restClient = this.createRestClient(token)
    await restClient.post({
      path: `/intervention/user`,
      headers: { Accept: 'application/json' },
    })
  }
}
