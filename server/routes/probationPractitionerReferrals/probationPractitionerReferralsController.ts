import { Request, Response } from 'express'
import createError from 'http-errors'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService, { GetSentReferralsFilterParams } from '../../services/interventionsService'
import { ActionPlanAppointment } from '../../models/appointment'
import InterventionProgressPresenter from './interventionProgressPresenter'
import InterventionProgressView from './interventionProgressView'
import FindStartPresenter from './findStartPresenter'
import DashboardView from './dashboardView'
import DashboardPresenter, { PPDashboardType } from './dashboardPresenter'
import FindStartView from './findStartView'
import SubmittedFeedbackPresenter from '../shared/appointment/feedback/submittedFeedbackPresenter'
import SubmittedFeedbackView from '../shared/appointment/feedback/submittedFeedbackView'
import EndOfServiceReportPresenter from '../shared/endOfServiceReport/endOfServiceReportPresenter'
import EndOfServiceReportView from '../shared/endOfServiceReport/endOfServiceReportView'
import { FormValidationError } from '../../utils/formValidationError'
import ControllerUtils from '../../utils/controllerUtils'
import ShowReferralPresenter from '../shared/showReferralPresenter'
import ShowReferralView from '../shared/showReferralView'
import HmppsAuthService from '../../services/hmppsAuthService'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import ActionPlanPresenter from '../shared/action-plan/actionPlanPresenter'
import ActionPlanView from '../shared/action-plan/actionPlanView'
import ConfirmationCheckboxInput from '../../utils/forms/inputs/confirmationCheckboxInput'
import errorMessages from '../../utils/errorMessages'
import SupplierAssessmentDecorator from '../../decorators/supplierAssessmentDecorator'
import SupplierAssessmentAppointmentPresenter from '../shared/supplierAssessmentAppointmentPresenter'
import SupplierAssessmentAppointmentView from '../shared/supplierAssessmentAppointmentView'
import FileUtils from '../../utils/fileUtils'
import DraftsService from '../../services/draftsService'
import config from '../../config'
import AppointmentSummary from '../appointments/appointmentSummary'
import DeliusOfficeLocationFilter from '../../services/deliusOfficeLocationFilter'
import ReferenceDataService from '../../services/referenceDataService'
import SentReferral from '../../models/sentReferral'
import ActionPlan from '../../models/actionPlan'

export default class ProbationPractitionerReferralsController {
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

  async showOpenCases(req: Request, res: Response): Promise<void> {
    await this.showDashboard(res, { concluded: false }, 'Open cases')
  }

  async showUnassignedCases(req: Request, res: Response): Promise<void> {
    await this.showDashboard(res, { concluded: false, unassigned: true }, 'Unassigned cases')
  }

  async showCompletedCases(req: Request, res: Response): Promise<void> {
    await this.showDashboard(res, { concluded: true, cancelled: false }, 'Completed cases')
  }

  async showCancelledCases(req: Request, res: Response): Promise<void> {
    await this.showDashboard(res, { cancelled: true }, 'Cancelled cases')
  }

  private async showDashboard(
    res: Response,
    getSentReferralsFilterParams: GetSentReferralsFilterParams,
    dashboardType: PPDashboardType
  ) {
    const cases = await this.interventionsService.getSentReferralsForUserToken(
      res.locals.user.token.accessToken,
      getSentReferralsFilterParams
    )

    const dedupedInterventionIds = Array.from(new Set(cases.map(referral => referral.referral.interventionId)))
    const interventions = await Promise.all(
      dedupedInterventionIds.map(id => this.interventionsService.getIntervention(res.locals.user.token.accessToken, id))
    )

    const presenter = new DashboardPresenter(cases, interventions, res.locals.user, dashboardType)
    const view = new DashboardView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }

  async showFindStartPage(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUserToken(accessToken)

    const structuredInterventionsFileDownloadPaths = {
      xlsx: 'assets/downloads/Structured interventions list v1_3_3.xlsx',
      pdf: 'assets/downloads/Structured interventions list v1_3_3.pdf',
    }

    const downloadFileSize = await FileUtils.fileSize(structuredInterventionsFileDownloadPaths.xlsx)
    const presenter = new FindStartPresenter(
      existingDraftReferrals,
      structuredInterventionsFileDownloadPaths,
      downloadFileSize,
      res.locals.user
    )

    const view = new FindStartView(presenter)

    ControllerUtils.renderWithLayout(res, view, null)
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
    const supplierAssessmentPromise = this.interventionsService.getSupplierAssessment(
      res.locals.user.token.accessToken,
      sentReferral.id
    )
    const assigneePromise = sentReferral.assignedTo
      ? this.hmppsAuthService.getSPUserByUsername(res.locals.user.token.accessToken, sentReferral.assignedTo.username)
      : Promise.resolve(null)

    const [intervention, actionPlan, serviceUser, supplierAssessment, assignee] = await Promise.all([
      interventionPromise,
      actionPlanPromise,
      serviceUserPromise,
      supplierAssessmentPromise,
      assigneePromise,
    ])

    let actionPlanAppointments: ActionPlanAppointment[] = []
    if (actionPlan !== null && actionPlan.submittedAt !== null) {
      actionPlanAppointments = await this.interventionsService.getActionPlanAppointments(
        res.locals.user.token.accessToken,
        actionPlan.id
      )
    }

    const presenter = new InterventionProgressPresenter(
      sentReferral,
      intervention,
      actionPlanAppointments,
      actionPlan,
      supplierAssessment,
      assignee
    )
    const view = new InterventionProgressView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
        : await this.hmppsAuthService.getSPUserByUsername(
            res.locals.user.token.accessToken,
            sentReferral.assignedTo.username
          )

    const presenter = new ShowReferralPresenter(
      sentReferral,
      intervention,
      conviction,
      riskInformation,
      sentBy,
      assignee,
      null,
      'probation-practitioner',
      false,
      expandedServiceUser,
      riskSummary,
      responsibleOfficer
    )
    const view = new ShowReferralView(presenter)
    ControllerUtils.renderWithLayout(res, view, expandedServiceUser)
  }

  async viewSubmittedPostSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { referralId, sessionNumber } = req.params

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (referral.actionPlanId === null) {
      throw createError(500, `action plan does not exist on this referral '${req.params.id}'`, {
        userMessage: 'No action plan exists for this referral',
      })
    }

    const currentAppointment = await this.interventionsService.getActionPlanAppointment(
      accessToken,
      referral.actionPlanId,
      Number(sessionNumber)
    )
    const deliusOfficeLocation = await this.deliusOfficeLocationFilter.findOfficeByAppointment(currentAppointment)

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    if (!referral.assignedTo) {
      throw new Error('Referral has not yet been assigned to a caseworker')
    }

    const presenter = new SubmittedFeedbackPresenter(
      currentAppointment,
      new AppointmentSummary(currentAppointment, referral.assignedTo, deliusOfficeLocation),
      serviceUser,
      'probation-practitioner',
      referral.id,
      null
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  // This is left to keep links in old emails still working - we'll monitor the endpoint and remove it when usage drops off.
  async viewLegacySubmittedPostSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber } = req.params

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)
    const currentAppointment = await this.interventionsService.getActionPlanAppointment(
      accessToken,
      actionPlanId,
      Number(sessionNumber)
    )
    const deliusOfficeLocation = await this.deliusOfficeLocationFilter.findOfficeByAppointment(currentAppointment)

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    if (!referral.assignedTo) {
      throw new Error('Referral has not yet been assigned to a caseworker')
    }

    const presenter = new SubmittedFeedbackPresenter(
      currentAppointment,
      new AppointmentSummary(currentAppointment, referral.assignedTo, deliusOfficeLocation),
      serviceUser,
      'probation-practitioner',
      referral.id,
      null
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewSubmittedPostAssessmentFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])

    if (!referral.assignedTo) {
      throw new Error('Referral has not yet been assigned to a caseworker')
    }

    const { currentAppointment } = new SupplierAssessmentDecorator(supplierAssessment)
    if (currentAppointment === null) {
      throw new Error('Attempting to view initial assessment feedback without a current appointment')
    }
    const deliusOfficeLocation = await this.deliusOfficeLocationFilter.findOfficeByAppointment(currentAppointment)

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new SubmittedFeedbackPresenter(
      currentAppointment,
      new AppointmentSummary(currentAppointment, null, deliusOfficeLocation),
      serviceUser,
      'probation-practitioner',
      referralId
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
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
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportPresenter(referral, endOfServiceReport, serviceCategories)
    const view = new EndOfServiceReportView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewLatestActionPlan(req: Request, res: Response): Promise<void> {
    await this.renderLatestActionPlan(req, res)
  }

  private async renderLatestActionPlan(
    req: Request,
    res: Response,
    formValidationError: FormValidationError | null = null
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    if (sentReferral.actionPlanId === null) {
      throw createError(500, `could not view action plan for referral with id '${req.params.id}'`, {
        userMessage: 'No action plan exists for this referral',
      })
    }

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId)

    return this.renderActionPlan(res, sentReferral, actionPlan, formValidationError)
  }

  async viewActionPlanById(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, req.params.actionPlanId)

    if (actionPlan === null) {
      throw createError(500, `No action plan found with id '${req.params.actionPlanId}'`, {
        userMessage: 'No action plan was found',
      })
    }

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)

    if (sentReferral === null) {
      throw createError(500, `No referral found with with id '${actionPlan.referralId}'`, {
        userMessage: 'No action plan was found',
      })
    }

    return this.renderActionPlan(res, sentReferral, actionPlan)
  }

  private async renderActionPlan(
    res: Response,
    sentReferral: SentReferral,
    actionPlan: ActionPlan,
    formValidationError: FormValidationError | null = null
  ) {
    const { accessToken } = res.locals.user.token

    const [serviceCategories, serviceUser, actionPlanVersions] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
      config.features.previouslyApprovedActionPlans
        ? this.interventionsService.getApprovedActionPlanSummaries(accessToken, sentReferral.id)
        : [],
    ])

    const presenter = new ActionPlanPresenter(
      sentReferral,
      actionPlan,
      serviceCategories,
      'probation-practitioner',
      formValidationError,
      actionPlanVersions
    )
    const view = new ActionPlanView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async approveActionPlan(req: Request, res: Response): Promise<void> {
    const confirmApprovalResult = await new ConfirmationCheckboxInput(
      req,
      'confirm-approval',
      'confirmed',
      errorMessages.actionPlanApproval.notConfirmed
    ).validate()
    if (confirmApprovalResult.error) {
      return this.renderLatestActionPlan(req, res, confirmApprovalResult.error)
    }
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    if (sentReferral.actionPlanId === null) {
      throw createError(500, `could not approve action plan for referral with id '${sentReferral.id}'`, {
        userMessage: 'No action plan exists for this referral',
      })
    }

    await this.interventionsService.approveActionPlan(accessToken, sentReferral.actionPlanId)
    return res.redirect(`/probation-practitioner/referrals/${sentReferral.id}/action-plan/approved`)
  }

  async actionPlanApproved(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)

    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)

    ControllerUtils.renderWithLayout(
      res,
      {
        renderArgs: [
          'probationPractitionerReferrals/actionPlanApproved',
          {
            backButtonArgs: {
              text: 'Return to intervention progress',
              href: `/probation-practitioner/referrals/${sentReferral.id}/progress`,
            },
          },
        ],
      },
      serviceUser
    )
  }

  async showSupplierAssessmentAppointment(req: Request, res: Response): Promise<void> {
    const referralId = req.params.id

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(res.locals.user.token.accessToken, referralId),

      this.interventionsService.getSupplierAssessment(res.locals.user.token.accessToken, referralId),
    ])

    const assignee =
      referral.assignedTo === null
        ? null
        : await this.hmppsAuthService.getSPUserByUsername(
            res.locals.user.token.accessToken,
            referral.assignedTo.username
          )

    const appointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
    if (appointment === null) {
      throw new Error('Attempting to view initial assessment without a current appointment')
    }
    const deliusOfficeLocation = await this.deliusOfficeLocationFilter.findOfficeByAppointment(appointment)

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new SupplierAssessmentAppointmentPresenter(
      referral,
      appointment,
      new AppointmentSummary(appointment, assignee, deliusOfficeLocation),
      {
        readonly: true,
        userType: 'probation-practitioner',
      }
    )
    const view = new SupplierAssessmentAppointmentView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }
}
