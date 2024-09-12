import { Request, Response } from 'express'
import createError from 'http-errors'
import querystring from 'querystring'
import InterventionsService, {
  GetSentReferralsFilterParams,
  InterventionsServiceError,
} from '../../services/interventionsService'
import ActionPlan from '../../models/actionPlan'
import HmppsAuthService from '../../services/hmppsAuthService'
import CheckAssignmentPresenter from './checkAssignmentPresenter'
import CheckAssignmentView from './checkAssignmentView'
import DashboardPresenter, { DashboardType } from './dashboardPresenter'
import DashboardView from './dashboardView'
import ShowReferralPresenter from '../shared/showReferralPresenter'
import ShowReferralView from '../shared/showReferralView'
import AssignmentConfirmationView from './assignmentConfirmationView'
import AssignmentConfirmationPresenter from './assignmentConfirmationPresenter'
import { FormValidationError } from '../../utils/formValidationError'
import errorMessages from '../../utils/errorMessages'
import AddActionPlanActivitiesPresenter from '../service-provider/action-plan/add-activities/addActionPlanActivitiesPresenter'
import AddActionPlanActivitiesView from '../service-provider/action-plan/add-activities/addActionPlanActivitiesView'
import InterventionProgressView from './interventionProgressView'
import InterventionProgressPresenter from './interventionProgressPresenter'
import AddActionPlanActivitiesForm from '../service-provider/action-plan/add-activities/addActionPlanActivitiesForm'
import FinaliseActionPlanActivitiesForm from './finaliseActionPlanActivitiesForm'
import ReviewActionPlanPresenter from '../service-provider/action-plan/review/reviewActionPlanPresenter'
import ReviewActionPlanView from '../service-provider/action-plan/review/reviewActionPlanView'
import ActionPlanConfirmationPresenter from '../service-provider/action-plan/confirmation/actionPlanConfirmationPresenter'
import ActionPlanConfirmationView from '../service-provider/action-plan/confirmation/actionPlanConfirmationView'
import AddActionPlanNumberOfSessionsView from '../service-provider/action-plan/number-of-sessions/actionPlanNumberOfSessionsView'
import AddActionPlanNumberOfSessionsPresenter from '../service-provider/action-plan/number-of-sessions/actionPlanNumberOfSessionsPresenter'
import ActionPlanNumberOfSessionsForm from '../service-provider/action-plan/number-of-sessions/actionPlanNumberOfSessionsForm'
import EndOfServiceReportOutcomeForm from '../service-provider/end-of-service-report/outcomes/endOfServiceReportOutcomeForm'
import EndOfServiceReportOutcomePresenter from '../service-provider/end-of-service-report/outcomes/endOfServiceReportOutcomePresenter'
import EndOfServiceReportOutcomeView from '../service-provider/end-of-service-report/outcomes/endOfServiceReportOutcomeView'
import EndOfServiceReportFurtherInformationForm from '../service-provider/end-of-service-report/further-information/endOfServiceReportFurtherInformationForm'
import EndOfServiceReportFurtherInformationPresenter from '../service-provider/end-of-service-report/further-information/endOfServiceReportFurtherInformationPresenter'
import EndOfServiceReportFurtherInformationView from '../service-provider/end-of-service-report/further-information/endOfServiceReportFurtherInformationView'
import EndOfServiceReportCheckAnswersPresenter from '../service-provider/end-of-service-report/check-answers/endOfServiceReportCheckAnswersPresenter'
import EndOfServiceReportCheckAnswersView from '../service-provider/end-of-service-report/check-answers/endOfServiceReportCheckAnswersView'
import EndOfServiceReportConfirmationPresenter from '../service-provider/end-of-service-report/confirmation/endOfServiceReportConfirmationPresenter'
import EndOfServiceReportConfirmationView from '../service-provider/end-of-service-report/confirmation/endOfServiceReportConfirmationView'
import ControllerUtils from '../../utils/controllerUtils'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import ActionPlanPresenter from '../shared/action-plan/actionPlanPresenter'
import ActionPlanView from '../shared/action-plan/actionPlanView'
import ActionPlanEditConfirmationPresenter from '../service-provider/action-plan/edit/actionPlanEditConfirmationPresenter'
import ActionPlanEditConfirmationView from '../service-provider/action-plan/edit/actionPlanEditConfirmationView'
import DraftsService from '../../services/draftsService'
import { ActionPlanAppointment, AppointmentSchedulingDetails } from '../../models/appointment'
import DeliusOfficeLocationFilter from '../../services/deliusOfficeLocationFilter'
import ReferenceDataService from '../../services/referenceDataService'
import createFormValidationErrorOrRethrow from '../../utils/interventionsFormError'
import EndOfServiceReportPresenter from '../shared/endOfServiceReport/endOfServiceReportPresenter'
import EndOfServiceReportView from '../shared/endOfServiceReport/endOfServiceReportView'
import ActionPlanUtils from '../../utils/actionPlanUtils'
import SentReferral from '../../models/sentReferral'
import config from '../../config'
import ServiceProviderSentReferralSummary from '../../models/serviceProviderSentReferralSummary'
import DashboardWithoutPaginationPresenter from '../deprecated/dashboardWithoutPaginationPresenter'
import DashboardWithoutPaginationView from '../deprecated/dashboardWithoutPaginationView'
import UserDataService from '../../services/userDataService'
import PrisonRegisterService from '../../services/prisonRegisterService'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SupplierAssessmentDecorator from '../../decorators/supplierAssessmentDecorator'
import PrisonAndSecureChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'

export interface DraftAssignmentData {
  email: string | null
}

export type DraftAppointmentBooking = null | AppointmentSchedulingDetails

export default class ServiceProviderReferralsController {
  private readonly deliusOfficeLocationFilter: DeliusOfficeLocationFilter

  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService,
    private readonly draftsService: DraftsService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly userDataService: UserDataService,
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly prisonAndSecureChildAgencyService: PrisonAndSecureChildAgencyService,
    private readonly ramDeliusApiService: RamDeliusApiService
  ) {
    this.deliusOfficeLocationFilter = new DeliusOfficeLocationFilter(referenceDataService)
  }

  async showMyCasesDashboard(req: Request, res: Response): Promise<void> {
    const pageSize = config.dashboards.serviceProvider.myCases
    return this.renderDashboard(
      req,
      res,
      { completed: false, cancelled: false, assignedTo: res.locals.user.userId },
      'My cases',
      'spMyCases',
      pageSize
    )
  }

  private handlePaginatedSearchText(req: Request) {
    if (req.method === 'GET' && req.query.paginatedSearch === 'true') {
      req.body['case-search-text'] = req.session.searchText
    }

    if (req.method === 'GET' && req.query.paginatedSearch === undefined) {
      req.session.searchText = undefined
    }

    if (req.method === 'POST') {
      req.session.searchText = req.body['case-search-text'] as string
    }
  }

  async showAllOpenCasesDashboard(req: Request, res: Response): Promise<void> {
    this.handlePaginatedSearchText(req)
    const searchText = (req.body['case-search-text'] as string) ?? null
    const pageSize = config.dashboards.serviceProvider.openCases
    return this.renderDashboard(
      req,
      res,
      { completed: false, cancelled: false, search: searchText?.trim() },
      'All open cases',
      'spAllOpenCases',
      pageSize
    )
  }

  async showUnassignedCasesDashboard(req: Request, res: Response): Promise<void> {
    this.handlePaginatedSearchText(req)
    const searchText = (req.body['case-search-text'] as string) ?? null

    const pageSize = config.dashboards.serviceProvider.unassignedCases
    return this.renderDashboard(
      req,
      res,
      { completed: false, cancelled: false, unassigned: true, search: searchText?.trim() },
      'Unassigned cases',
      'spUnassignedCases',
      pageSize
    )
  }

  async showCompletedCasesDashboard(req: Request, res: Response): Promise<void> {
    this.handlePaginatedSearchText(req)
    const searchText = (req.body['case-search-text'] as string) ?? null

    const pageSize = config.dashboards.serviceProvider.completedCases
    return this.renderDashboard(
      req,
      res,
      { completed: true, cancelled: false, search: searchText?.trim() },
      'Completed cases',
      'spCompletedCases',
      pageSize
    )
  }

  async showCancelledCases(req: Request, res: Response): Promise<void> {
    this.handlePaginatedSearchText(req)
    const searchText = (req.body['case-search-text'] as string) ?? null

    const pageSize = config.dashboards.serviceProvider.cancelledCases
    return this.renderDashboard(
      req,
      res,
      { cancelled: true, search: searchText?.trim() },
      'Cancelled cases',
      'spCancelledCases',
      pageSize
    )
  }

  private async renderDashboard(
    req: Request,
    res: Response,
    getSentReferralsFilterParams: GetSentReferralsFilterParams,
    dashboardType: DashboardType,
    tablePersistentId: string,
    pageSize: number
  ) {
    if (req.query.dismissDowntimeBanner) {
      req.session.disableDowntimeBanner = true
    }
    const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
      req,
      res,
      this.userDataService,
      config.userData.spDashboardSortOrder.storageDurationInSeconds,
      tablePersistentId,
      DashboardPresenter.headingsAndSortFields.map(it => it.sortField).filter(it => it) as string[],
      'sentat,DESC',
      'sentat,DESC'
    )

    const paginationQuery = {
      page: ControllerUtils.parseQueryParamAsPositiveInteger(req, 'page') ?? undefined,
      size: pageSize,
      sort,
    }

    /**
     * This is done to save any new user to interventions db before calling the sent referral summaries api
     * This will then enable us to switch sent referral summaries api to read only dbs
     * */
    await this.interventionsService.addNewUserToIntervention(res.locals.user.token.accessToken)

    const cases = await this.interventionsService.getSentReferralsForUserTokenPaged(
      res.locals.user.token.accessToken,
      getSentReferralsFilterParams,
      paginationQuery
    )

    req.session.dashboardOriginPage = req.originalUrl
    const disablePlannedDowntimeNotification = req.session.disableDowntimeBanner
      ? req.session.disableDowntimeBanner
      : false

    const prisonAndSecureChildAgencyService = await Promise.resolve(
      this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(res.locals.user.token.accessToken)
    )

    const presenter = new DashboardPresenter(
      cases,
      dashboardType,
      res.locals.user,
      tablePersistentId,
      sort[0],
      disablePlannedDowntimeNotification,
      req.session.dashboardOriginPage,
      prisonAndSecureChildAgencyService,
      getSentReferralsFilterParams.search
    )
    const view = new DashboardView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, null, 'service-provider')
  }

  // To be removed once we are happy with the pagination work.
  private async renderDashboardWithoutPagination(
    req: Request,
    res: Response,
    referralsSummary: ServiceProviderSentReferralSummary[],
    dashboardType: DashboardType,
    searchText?: string
  ): Promise<void> {
    req.session.dashboardOriginPage = req.originalUrl
    const presenter = new DashboardWithoutPaginationPresenter(
      referralsSummary,
      dashboardType,
      res.locals.user,
      searchText
    )
    const view = new DashboardWithoutPaginationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, null, 'service-provider').then()
  }

  async showReferral(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    const { crn } = sentReferral.referral.serviceUser
    const [
      intervention,
      sentBy,
      caseConviction,
      riskInformation,
      riskSummary,
      prisonsAndChildSecureAgencies,
      deliusResponsibleOfficer,
      prisonerDetails,
    ] = await Promise.all([
      this.interventionsService.getIntervention(accessToken, sentReferral.referral.interventionId),
      this.ramDeliusApiService.getUserByUsername(sentReferral.sentBy.username),
      this.ramDeliusApiService.getConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId),
      this.assessRisksAndNeedsService.getSupplementaryRiskInformation(sentReferral.supplementaryRiskId, accessToken),
      this.assessRisksAndNeedsService.getRiskSummary(crn, accessToken),
      this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(accessToken),
      this.ramDeliusApiService.getResponsibleOfficer(sentReferral.referral.serviceUser.crn),
      this.interventionsService.getPrisonerDetails(accessToken, crn),
    ])

    const assignee =
      sentReferral.assignedTo === null
        ? null
        : await this.hmppsAuthService.getSPUserByUsername(accessToken, sentReferral.assignedTo.username)

    let formError: FormValidationError | null = null
    const error = req.query.error as string
    if (error !== undefined || error !== '') {
      formError = {
        errors: [
          {
            formFields: ['email'],
            errorSummaryLinkedField: 'email',
            message: error,
          },
        ],
      }
    }

    const presenter = new ShowReferralPresenter(
      sentReferral,
      intervention,
      caseConviction.conviction,
      riskInformation,
      sentBy,
      prisonsAndChildSecureAgencies,
      assignee,
      formError,
      'service-provider',
      true,
      caseConviction.caseDetail,
      riskSummary,
      deliusResponsibleOfficer,
      prisonerDetails,
      false,
      req.session.dashboardOriginPage
    )
    const view = new ShowReferralView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, caseConviction.caseDetail, 'service-provider')
  }

  async showInterventionProgress(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id } = req.params
    const { showFeedbackBanner } = req.query
    const { notifyPP } = req.query
    const { dna } = req.query
    const { saa } = req.query

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, id)

    const serviceUserPromise = this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)
    const interventionPromise = this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )

    const actionPlanPromise =
      sentReferral.actionPlanId === null
        ? Promise.resolve(null)
        : this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId)

    const [intervention, actionPlan, approvedActionPlanSummaries, serviceUser, supplierAssessment] = await Promise.all([
      interventionPromise,
      actionPlanPromise,
      this.interventionsService.getApprovedActionPlanSummaries(accessToken, id),
      serviceUserPromise,
      this.interventionsService.getSupplierAssessment(accessToken, sentReferral.id),
    ])

    // appointments should always come from the latest approved action plan
    const latestApprovedActionPlanSummary =
      ActionPlanUtils.getLatestApprovedActionPlanSummary(approvedActionPlanSummaries)
    let actionPlanAppointments: ActionPlanAppointment[] = []
    if (latestApprovedActionPlanSummary !== null) {
      actionPlanAppointments = await this.interventionsService
        .getActionPlanAppointments(accessToken, latestApprovedActionPlanSummary.id)
        .then(actionPlanAppointmentsReturned => {
          return actionPlanAppointmentsReturned.flatMap(x => {
            return [
              x,
              ...(x.oldAppointments
                ? x.oldAppointments!.map(y => {
                    const actionPlanAppointment: ActionPlanAppointment = {
                      sessionNumber: x.sessionNumber,
                      appointmentId: y.id,
                      ...y,
                    }
                    return actionPlanAppointment
                  })
                : []),
            ]
          })
        })
    }

    const assignee =
      sentReferral.assignedTo === null
        ? null
        : await this.hmppsAuthService.getSPUserByUsername(accessToken, sentReferral.assignedTo.username)

    const presenter = new InterventionProgressPresenter(
      sentReferral,
      intervention,
      actionPlan,
      approvedActionPlanSummaries,
      actionPlanAppointments,
      supplierAssessment,
      serviceUser,
      assignee,
      req.session.dashboardOriginPage,
      showFeedbackBanner === 'true',
      notifyPP === 'true',
      dna === 'true',
      saa === 'true'
    )
    const view = new InterventionProgressView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async startAssignment(req: Request, res: Response): Promise<void> {
    const { email } = req.body

    if (email === undefined || email === '') {
      return res.redirect(
        `/service-provider/referrals/${req.params.id}/details?${querystring.stringify({
          error: errorMessages.assignReferral.emailEmpty,
        })}`
      )
    }

    const token = await this.hmppsAuthService.getApiClientToken()

    try {
      await this.hmppsAuthService.getSPUserByEmailAddress(token, email)
    } catch (e) {
      return res.redirect(
        `/service-provider/referrals/${req.params.id}/details?${querystring.stringify({
          error: errorMessages.assignReferral.emailNotFound,
        })}`
      )
    }

    const draftAssignment = await this.draftsService.createDraft<DraftAssignmentData>(
      'assignment',
      { email },
      { userId: res.locals.user.userId }
    )

    return res.redirect(`/service-provider/referrals/${req.params.id}/assignment/${draftAssignment.id}/check`)
  }

  private async fetchDraftAssignmentOrRenderMessage(req: Request, res: Response) {
    const backLink = {
      target: `/service-provider/referrals/${req.params.id}/details`,
      message: 'assign the referral',
    }
    return ControllerUtils.fetchDraftOrRenderMessage<DraftAssignmentData>(
      req,
      res,
      this.draftsService,
      'service-provider',
      {
        idParamName: 'draftAssignmentId',
        notFoundUserMessage:
          'You have not assigned this referral to a caseworker. This is because too much time has passed since you started assigning it.',
        typeName: 'assignment',
        backLink,
      }
    )
  }

  async checkAssignment(req: Request, res: Response): Promise<void> {
    const fetchResult = await this.fetchDraftAssignmentOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftAssignment = fetchResult.draft

    const { email } = draftAssignment.data

    if (email === null) {
      throw new Error('Got unexpectedly null email')
    }

    const token = await this.hmppsAuthService.getApiClientToken()
    const assignee = await this.hmppsAuthService.getSPUserByEmailAddress(token, email)
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)
    const [intervention, serviceUser] = await Promise.all([
      this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.referral.interventionId),
      this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn),
    ])

    const presenter = new CheckAssignmentPresenter(referral.id, draftAssignment.id, assignee, email, intervention)
    const view = new CheckAssignmentView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async submitAssignment(req: Request, res: Response): Promise<void> {
    const fetchResult = await this.fetchDraftAssignmentOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftAssignment = fetchResult.draft

    const { email } = draftAssignment.data
    if (email === null) {
      throw new Error('Got unexpectedly null email')
    }

    await this.submitAssignmentWithEmail(email, req, res)

    await this.draftsService.deleteDraft(draftAssignment.id, { userId: res.locals.user.userId })
  }

  async submitAssignmentWithEmail(email: string, req: Request, res: Response): Promise<void> {
    const assignee = await this.hmppsAuthService.getSPUserByEmailAddress(res.locals.user.token.accessToken, email)

    await this.interventionsService.assignSentReferral(res.locals.user.token.accessToken, req.params.id, {
      username: assignee.username,
      userId: assignee.userId,
      authSource: 'auth',
    })

    res.redirect(`/service-provider/referrals/${req.params.id}/assignment/confirmation`)
  }

  async confirmAssignment(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.assignedTo === null) {
      throw new Error('Can’t view confirmation of assignment, as referral isn’t assigned.')
    }

    const [assignee, intervention, serviceUser] = await Promise.all([
      this.hmppsAuthService.getSPUserByUsername(res.locals.user.token.accessToken, referral.assignedTo.username),
      this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.referral.interventionId),
      this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn),
    ])

    const presenter = new AssignmentConfirmationPresenter(
      referral,
      intervention,
      assignee,
      req.session.dashboardOriginPage
    )
    const view = new AssignmentConfirmationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async createDraftActionPlan(req: Request, res: Response): Promise<void> {
    const draftActionPlan = await this.interventionsService.createDraftActionPlan(
      res.locals.user.token.accessToken,
      req.params.id
    )

    res.redirect(303, `/service-provider/action-plan/${draftActionPlan.id}/add-activity/1`)
  }

  async showActionPlanAddActivitiesForm(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)

    const activityNumber = this.parseActivityNumber(req.params.number, actionPlan)

    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const [serviceCategories, serviceUser] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, activityNumber)
    const view = new AddActionPlanActivitiesView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async addOrUpdateActionPlanActivity(req: Request, res: Response): Promise<void> {
    const activityNumber = this.parseActivityNumber(req.params.number)

    const form = await AddActionPlanActivitiesForm.createForm(req)

    if (form.isValid) {
      if (form.isUpdate) {
        // update an existing activity
        await this.interventionsService.updateActionPlanActivity(
          res.locals.user.token.accessToken,
          req.params.id,
          form.activityParamsForUpdate.id,
          form.activityParamsForUpdate.description
        )
      } else {
        // add a new activity
        await this.interventionsService.updateDraftActionPlan(res.locals.user.token.accessToken, req.params.id, {
          newActivity: { description: form.activityParamsForUpdate.description },
        })
      }

      const nextActivityNumber = activityNumber + 1
      res.redirect(`/service-provider/action-plan/${req.params.id}/add-activity/${nextActivityNumber}`)
      return
    }

    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const [serviceCategories, serviceUser] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new AddActionPlanActivitiesPresenter(
      sentReferral,
      serviceCategories,
      actionPlan,
      activityNumber,
      form.error
    )
    const view = new AddActionPlanActivitiesView(presenter)

    res.status(400)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async finaliseActionPlanActivities(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const serviceCategories = await Promise.all(
      sentReferral.referral.serviceCategoryIds.map(id =>
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
      )
    )

    const form = new FinaliseActionPlanActivitiesForm(actionPlan)

    if (form.isValid) {
      res.redirect(`/service-provider/action-plan/${actionPlan.id}/number-of-sessions`)
    } else {
      const presenter = new AddActionPlanActivitiesPresenter(
        sentReferral,
        serviceCategories,
        actionPlan,
        actionPlan.activities.length + 1,
        form.error
      )
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)
      const view = new AddActionPlanActivitiesView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
    }
  }

  async reviewActionPlan(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )
    let formError: FormValidationError | null = null

    if (req.method === 'POST') {
      const supplierAssessmentAppointment = await this.interventionsService.getSupplierAssessment(
        res.locals.user.token.accessToken,
        actionPlan.referralId
      )
      const supplierAssessmentStatus = sessionStatus.forAppointment(
        new SupplierAssessmentDecorator(supplierAssessmentAppointment).currentAppointment
      )
      if (supplierAssessmentStatus === SessionStatus.completed) {
        await this.interventionsService.submitActionPlan(res.locals.user.token.accessToken, req.params.id)
        return res.redirect(`/service-provider/action-plan/${req.params.id}/confirmation`)
      }
      formError = {
        errors: [
          {
            formFields: [],
            errorSummaryLinkedField: '',
            message: errorMessages.reviewActionPlan.supplierAssessmentAppointmentIncomplete,
          },
        ],
      }
    }

    const [serviceCategories, serviceUser] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategories, actionPlan, formError)
    const view = new ReviewActionPlanView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async showActionPlanConfirmation(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)

    if (actionPlan.submittedAt === null) {
      throw new Error('Trying to view confirmation page for action plan that hasn’t been submitted')
    }

    const { accessToken: token } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(token, actionPlan.referralId)

    const [interventionForPresenterTitle, serviceUser] = await Promise.all([
      this.interventionsService.getIntervention(token, sentReferral.referral.interventionId),
      this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ActionPlanConfirmationPresenter(sentReferral, interventionForPresenterTitle.contractType.name)
    const view = new ActionPlanConfirmationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async addNumberOfSessionsToActionPlan(req: Request, res: Response): Promise<void> {
    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null
    const { accessToken: token } = res.locals.user.token
    const actionPlanId = req.params.id

    if (req.method === 'POST') {
      userInputData = req.body

      const form = await ActionPlanNumberOfSessionsForm.createForm(req)
      formError = form.error

      if (form.isValid) {
        try {
          await this.interventionsService.updateDraftActionPlan(token, actionPlanId, form.paramsForUpdate)
          return res.redirect(`/service-provider/action-plan/${actionPlanId}/review`)
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          formError = createFormValidationErrorOrRethrow(interventionsServiceError)
        }
      }
    }

    const actionPlan = await this.interventionsService.getActionPlan(token, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(token, actionPlan.referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      token,
      referral.referral.serviceCategoryIds[0]
    )
    const interventionForPresenterTitle = await this.interventionsService.getIntervention(
      token,
      referral.referral.interventionId
    )

    const presenter = new AddActionPlanNumberOfSessionsPresenter(
      actionPlan,
      serviceUser,
      serviceCategory,
      formError,
      userInputData,
      interventionForPresenterTitle.contractType.name
    )
    const view = new AddActionPlanNumberOfSessionsView(presenter)
    res.status(formError === null ? 200 : 400)
    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async createDraftEndOfServiceReport(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)

    let draftEndOfServiceReportId = referral.endOfServiceReport?.id

    if (!draftEndOfServiceReportId) {
      const draftEndOfServiceReport = await this.interventionsService.createDraftEndOfServiceReport(
        accessToken,
        referralId
      )

      draftEndOfServiceReportId = draftEndOfServiceReport.id
    }

    res.redirect(303, `/service-provider/end-of-service-report/${draftEndOfServiceReportId}/outcomes/1`)
  }

  async editEndOfServiceReportOutcome(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)

    const desiredOutcomeNumber = Number(req.params.number)
    const desiredOutcomeIds = referral.referral.desiredOutcomes.flatMap(
      desiredOutcome => desiredOutcome.desiredOutcomesIds
    )
    if (desiredOutcomeNumber > desiredOutcomeIds.length) {
      throw createError(400, 'Outcome number is out of bounds')
    }

    const desiredOutcomeId = desiredOutcomeIds[desiredOutcomeNumber - 1]

    const serviceCategories = await this.interventionsService.getServiceCategories(
      accessToken,
      referral.referral.serviceCategoryIds
    )

    const matchedServiceCategory = serviceCategories.find(serviceCategory =>
      serviceCategory.desiredOutcomes.some(desiredOutcome => desiredOutcome.id === desiredOutcomeId)
    )
    if (matchedServiceCategory === undefined) {
      throw new Error(`Desired outcome for ID ${desiredOutcomeId} not found`)
    }
    const matchedDesiredOutcome = matchedServiceCategory.desiredOutcomes.find(val => val.id === desiredOutcomeId)

    if (matchedDesiredOutcome === undefined) {
      throw new Error(`Desired outcome for ID ${desiredOutcomeId} not found`)
    }

    const outcome = endOfServiceReport.outcomes.find(val => val.desiredOutcome.id === desiredOutcomeId) ?? null

    let formValidationError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    if (req.method === 'POST') {
      userInputData = req.body
      const form = new EndOfServiceReportOutcomeForm(req, desiredOutcomeId, referral.referral.serviceUser)
      const formData = await form.data()

      if (formData.error) {
        formValidationError = formData.error
        res.status(400)
      } else {
        await this.interventionsService.updateDraftEndOfServiceReport(
          accessToken,
          endOfServiceReport.id,
          formData.paramsForUpdate
        )

        const isLastDesiredOutcome = desiredOutcomeNumber === desiredOutcomeIds.length
        if (isLastDesiredOutcome) {
          res.redirect(`/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)
        } else {
          res.redirect(
            `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/${desiredOutcomeNumber + 1}`
          )
        }
        return
      }
    }

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const interventionForPresenterTitle = await this.interventionsService.getIntervention(
      accessToken,
      referral.referral.interventionId
    )

    const presenter = new EndOfServiceReportOutcomePresenter(
      referral,
      endOfServiceReport,
      matchedDesiredOutcome,
      desiredOutcomeNumber,
      interventionForPresenterTitle.contractType.name,
      outcome,
      userInputData,
      formValidationError
    )
    const view = new EndOfServiceReportOutcomeView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async editEndOfServiceReportFurtherInformation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id } = req.params

    if (req.method === 'POST') {
      const form = new EndOfServiceReportFurtherInformationForm(req)
      await this.interventionsService.updateDraftEndOfServiceReport(accessToken, id, form.paramsForUpdate)
      res.redirect(`/service-provider/end-of-service-report/${id}/check-answers`)
      return
    }

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.interventionsService.getServiceCategories(
      accessToken,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const interventionForPresenterTitle = await this.interventionsService.getIntervention(
      accessToken,
      referral.referral.interventionId
    )

    const presenter = new EndOfServiceReportFurtherInformationPresenter(
      endOfServiceReport,
      serviceCategories[0],
      referral,
      null,
      interventionForPresenterTitle.contractType.name
    )
    const view = new EndOfServiceReportFurtherInformationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async endOfServiceReportCheckAnswers(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.interventionsService.getServiceCategories(
      accessToken,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const interventionForPresenterTitle = await this.interventionsService.getIntervention(
      accessToken,
      referral.referral.interventionId
    )

    const presenter = new EndOfServiceReportCheckAnswersPresenter(
      referral,
      endOfServiceReport,
      serviceCategories,
      interventionForPresenterTitle.contractType.name
    )
    const view = new EndOfServiceReportCheckAnswersView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async submitEndOfServiceReport(req: Request, res: Response): Promise<void> {
    await this.interventionsService.submitEndOfServiceReport(res.locals.user.token.accessToken, req.params.id)
    res.redirect(`/service-provider/end-of-service-report/${req.params.id}/confirmation`)
  }

  async showEndOfServiceReportConfirmation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const interventionForPresenterTitle = await this.interventionsService.getIntervention(
      accessToken,
      referral.referral.interventionId
    )

    const presenter = new EndOfServiceReportConfirmationPresenter(
      referral,
      interventionForPresenterTitle.contractType.name
    )
    const view = new EndOfServiceReportConfirmationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async viewEndOfServiceReport(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.interventionsService.getServiceCategories(
      accessToken,
      referral.referral.serviceCategoryIds
    )

    if (endOfServiceReport.submittedAt === null) {
      throw new Error(
        'You cannot view an end of service report that has not yet been submitted. Please submit the end of service report before trying to view it.'
      )
    }

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportPresenter(
      referral,
      endOfServiceReport,
      serviceCategories,
      'service-provider'
    )
    const view = new EndOfServiceReportView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async viewActionPlan(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    if (sentReferral.actionPlanId === null) {
      throw createError(500, `could not view action plan for referral with id '${req.params.id}'`, {
        userMessage: 'No action plan exists for this referral',
      })
    }

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId)
    return this.renderActionPlan(req, res, sentReferral, actionPlan)
  }

  async viewActionPlanById(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id } = req.params

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, id)
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)

    return this.renderActionPlan(req, res, sentReferral, actionPlan)
  }

  private async renderActionPlan(req: Request, res: Response, sentReferral: SentReferral, actionPlan: ActionPlan) {
    const { accessToken } = res.locals.user.token

    const [serviceCategories, serviceUser, approvedActionPlanSummaries] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(it =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, it)
        )
      ),
      this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
      this.interventionsService.getApprovedActionPlanSummaries(accessToken, sentReferral.id),
    ])

    const presenter = new ActionPlanPresenter(
      sentReferral,
      actionPlan,
      serviceCategories,
      'service-provider',
      null,
      approvedActionPlanSummaries
    )
    const view = new ActionPlanView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async actionPlanEditConfirmation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    if (sentReferral.actionPlanId === null) {
      throw createError(500, `could not edit action plan for referral with id '${req.params.id}'`, {
        userMessage: 'No action plan exists for this referral',
      })
    }

    const [serviceUser, actionPlan] = await Promise.all([
      await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
      await this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId),
    ])

    const presenter = new ActionPlanEditConfirmationPresenter(actionPlan)
    const view = new ActionPlanEditConfirmationView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async createNewDraftActionPlan(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    if (sentReferral.actionPlanId === null) {
      throw createError(500, `could not create new draft action plan for referral with id '${req.params.id}'`, {
        userMessage: 'No existing action plan exists for this referral',
      })
    }

    const existingActionPlan = await this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId)
    const newDraftActionPlan = await this.interventionsService.createDraftActionPlan(
      accessToken,
      sentReferral.id,
      existingActionPlan.numberOfSessions || undefined,
      existingActionPlan.activities
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
        .map(it => {
          return { description: it.description }
        })
    )
    res.redirect(303, `/service-provider/action-plan/${newDraftActionPlan.id}/add-activity/1`)
  }

  async showWhatsNew(req: Request, res: Response): Promise<void> {
    await ControllerUtils.renderWithLayout(
      req,
      res,
      {
        renderArgs: [
          'serviceProviderReferrals/whatsNew',
          {
            backButtonArgs: {
              text: 'Back',
              href: req.query.backHref,
            },
            hideWhatsNewBanner: true,
          },
        ],
      },
      null,
      'service-provider'
    )
  }

  private parseActivityNumber(number: string, actionPlan?: ActionPlan): number {
    const activityNumber = Number(number)
    if (Number.isNaN(activityNumber)) {
      throw createError(500, 'activity number specified in URL cannot be parsed')
    }

    if (actionPlan && activityNumber > actionPlan.activities.length + 1) {
      throw createError(500, 'activity number specified in URL is too big')
    }

    return activityNumber
  }
}
