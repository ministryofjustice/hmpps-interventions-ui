import { Request, Response } from 'express'
import createError from 'http-errors'
import querystring from 'querystring'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService, { InterventionsServiceError, SPDashboardType } from '../../services/interventionsService'
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
import ServiceCategory from '../../models/serviceCategory'
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
import ServiceProviderSentReferralSummary from '../../models/serviceProviderSentReferralSummary'

export interface DraftAssignmentData {
  email: string | null
}

export type DraftAppointmentBooking = null | AppointmentSchedulingDetails

export default class ServiceProviderReferralsController {
  private readonly deliusOfficeLocationFilter: DeliusOfficeLocationFilter

  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService,
    private readonly draftsService: DraftsService,
    private readonly referenceDataService: ReferenceDataService
  ) {
    this.deliusOfficeLocationFilter = new DeliusOfficeLocationFilter(referenceDataService)
  }

  async showMyCasesDashboard(req: Request, res: Response): Promise<void> {
    const referralsSummary = await this.interventionsService.getServiceProviderSentReferralsSummaryForUserToken(
      res.locals.user.token.accessToken,
      SPDashboardType.MyCases
    )
    this.renderDashboard(res, referralsSummary, 'My cases')
  }

  async showAllOpenCasesDashboard(req: Request, res: Response): Promise<void> {
    const referralsSummary = await this.interventionsService.getServiceProviderSentReferralsSummaryForUserToken(
      res.locals.user.token.accessToken,
      SPDashboardType.OpenCases
    )
    this.renderDashboard(res, referralsSummary, 'All open cases')
  }

  async showUnassignedCasesDashboard(req: Request, res: Response): Promise<void> {
    const referralsSummary = await this.interventionsService.getServiceProviderSentReferralsSummaryForUserToken(
      res.locals.user.token.accessToken,
      SPDashboardType.UnassignedCases
    )
    this.renderDashboard(res, referralsSummary, 'Unassigned cases')
  }

  async showCompletedCasesDashboard(req: Request, res: Response): Promise<void> {
    const referralsSummary = await this.interventionsService.getServiceProviderSentReferralsSummaryForUserToken(
      res.locals.user.token.accessToken,
      SPDashboardType.CompletedCases
    )
    this.renderDashboard(res, referralsSummary, 'Completed cases')
  }

  private renderDashboard(
    res: Response,
    referralsSummary: ServiceProviderSentReferralSummary[],
    dashboardType: DashboardType
  ): void {
    const presenter = new DashboardPresenter(referralsSummary, dashboardType, res.locals.user)
    const view = new DashboardView(presenter)

    ControllerUtils.renderWithLayout(res, view, null)
  }

  async showReferral(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    const { crn } = sentReferral.referral.serviceUser
    const [intervention, sentBy, expandedServiceUser, conviction, riskInformation, riskSummary, responsibleOfficer] =
      await Promise.all([
        this.interventionsService.getIntervention(accessToken, sentReferral.referral.interventionId),
        this.communityApiService.getUserByUsername(sentReferral.sentBy.username),
        this.communityApiService.getExpandedServiceUserByCRN(crn),
        this.communityApiService.getConvictionById(crn, sentReferral.referral.relevantSentenceId),
        this.assessRisksAndNeedsService.getSupplementaryRiskInformation(sentReferral.supplementaryRiskId, accessToken),
        this.assessRisksAndNeedsService.getRiskSummary(crn, accessToken),
        this.communityApiService.getResponsibleOfficerForServiceUser(crn),
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
      conviction,
      riskInformation,
      sentBy,
      assignee,
      formError,
      'service-provider',
      true,
      expandedServiceUser,
      riskSummary,
      responsibleOfficer
    )
    const view = new ShowReferralView(presenter)

    ControllerUtils.renderWithLayout(res, view, expandedServiceUser)
  }

  async showInterventionProgress(req: Request, res: Response): Promise<void> {
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      req.params.id
    )
    const serviceUserPromise = this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const interventionPromise = this.interventionsService.getIntervention(
      res.locals.user.token.accessToken,
      sentReferral.referral.interventionId
    )
    const actionPlanPromise =
      sentReferral.actionPlanId === null
        ? Promise.resolve(null)
        : this.interventionsService.getActionPlan(res.locals.user.token.accessToken, sentReferral.actionPlanId)

    const [intervention, actionPlan, serviceUser, supplierAssessment] = await Promise.all([
      interventionPromise,
      actionPlanPromise,
      serviceUserPromise,
      this.interventionsService.getSupplierAssessment(res.locals.user.token.accessToken, sentReferral.id),
    ])

    let actionPlanAppointments: ActionPlanAppointment[] = []
    if (actionPlan !== null && actionPlan.submittedAt !== null) {
      actionPlanAppointments = await this.interventionsService.getActionPlanAppointments(
        res.locals.user.token.accessToken,
        actionPlan.id
      )
    }

    const assignee =
      sentReferral.assignedTo === null
        ? null
        : await this.hmppsAuthService.getSPUserByUsername(
            res.locals.user.token.accessToken,
            sentReferral.assignedTo.username
          )

    const presenter = new InterventionProgressPresenter(
      sentReferral,
      intervention,
      actionPlan,
      actionPlanAppointments,
      supplierAssessment,
      assignee
    )
    const view = new InterventionProgressView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
    return ControllerUtils.fetchDraftOrRenderMessage<DraftAssignmentData>(req, res, this.draftsService, {
      idParamName: 'draftAssignmentId',
      notFoundUserMessage:
        'Too much time has passed since you started assigning this intervention to a caseworker. The referral has not been assigned, and you will need to start again.',
      typeName: 'assignment',
    })
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
      this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn),
    ])

    const presenter = new CheckAssignmentPresenter(referral.id, draftAssignment.id, assignee, email, intervention)
    const view = new CheckAssignmentView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
      this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn),
    ])

    const presenter = new AssignmentConfirmationPresenter(referral, intervention, assignee)
    const view = new AssignmentConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, activityNumber)
    const view = new AddActionPlanActivitiesView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
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
    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
      const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
      const view = new AddActionPlanActivitiesView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async reviewActionPlan(req: Request, res: Response): Promise<void> {
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
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategories, actionPlan)
    const view = new ReviewActionPlanView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitActionPlan(req: Request, res: Response): Promise<void> {
    await this.interventionsService.submitActionPlan(res.locals.user.token.accessToken, req.params.id)
    res.redirect(`/service-provider/action-plan/${req.params.id}/confirmation`)
  }

  async showActionPlanConfirmation(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)

    if (actionPlan.submittedAt === null) {
      throw new Error('Trying to view confirmation page for action plan that hasn’t been submitted')
    }

    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(
        res.locals.user.token.accessToken,
        sentReferral.referral.serviceCategoryIds[0]
      ),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ActionPlanConfirmationPresenter(sentReferral, serviceCategory)
    const view = new ActionPlanConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      token,
      referral.referral.serviceCategoryIds[0]
    )

    const presenter = new AddActionPlanNumberOfSessionsPresenter(
      actionPlan,
      serviceUser,
      serviceCategory,
      formError,
      userInputData
    )
    const view = new AddActionPlanNumberOfSessionsView(presenter)
    res.status(formError === null ? 200 : 400)
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
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

    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
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

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportOutcomePresenter(
      referral,
      endOfServiceReport,
      matchedServiceCategory,
      matchedDesiredOutcome,
      desiredOutcomeNumber,
      outcome,
      userInputData,
      formValidationError
    )
    const view = new EndOfServiceReportOutcomeView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportFurtherInformationPresenter(
      endOfServiceReport,
      serviceCategories[0],
      referral,
      null
    )
    const view = new EndOfServiceReportFurtherInformationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async endOfServiceReportCheckAnswers(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportCheckAnswersPresenter(referral, endOfServiceReport, serviceCategories)
    const view = new EndOfServiceReportCheckAnswersView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitEndOfServiceReport(req: Request, res: Response): Promise<void> {
    await this.interventionsService.submitEndOfServiceReport(res.locals.user.token.accessToken, req.params.id)
    res.redirect(`/service-provider/end-of-service-report/${req.params.id}/confirmation`)
  }

  async showEndOfServiceReportConfirmation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportConfirmationPresenter(referral, serviceCategories[0])
    const view = new EndOfServiceReportConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewEndOfServiceReport(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const intervention = await this.interventionsService.getIntervention(accessToken, referral.referral.interventionId)
    const serviceCategories = intervention.serviceCategories.filter(serviceCategory =>
      referral.referral.serviceCategoryIds.some(serviceCategoryId => serviceCategoryId === serviceCategory.id)
    )
    if (serviceCategories.length !== referral.referral.serviceCategoryIds.length) {
      throw new Error('Expected service categories are missing in intervention')
    }

    if (endOfServiceReport.submittedAt === null) {
      throw new Error(
        'You cannot view an end of service report that has not yet been submitted. Please submit the end of service report before trying to view it.'
      )
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportPresenter(referral, endOfServiceReport, serviceCategories)
    const view = new EndOfServiceReportView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewActionPlan(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    if (sentReferral.actionPlanId === null) {
      throw createError(500, `could not view action plan for referral with id '${req.params.id}'`, {
        userMessage: 'No action plan exists for this referral',
      })
    }

    const [serviceCategories, actionPlan, serviceUser] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ActionPlanPresenter(sentReferral, actionPlan, serviceCategories, 'service-provider')
    const view = new ActionPlanView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
      await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
      await this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId),
    ])

    const presenter = new ActionPlanEditConfirmationPresenter(sentReferral, actionPlan)
    const view = new ActionPlanEditConfirmationView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
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

  private async findSelectedServiceCategories(
    accessToken: string,
    interventionId: string,
    selectedServiceCategoryIds: string[]
  ): Promise<ServiceCategory[]> {
    const intervention = await this.interventionsService.getIntervention(accessToken, interventionId)
    const serviceCategories = intervention.serviceCategories.filter(serviceCategory =>
      selectedServiceCategoryIds.some(serviceCategoryId => serviceCategoryId === serviceCategory.id)
    )
    if (serviceCategories.length !== selectedServiceCategoryIds.length) {
      throw new Error('Expected service categories are missing in intervention')
    }
    return serviceCategories
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
