import { Request, Response } from 'express'
import createError from 'http-errors'
import InterventionsService, { GetSentReferralsFilterParams } from '../../services/interventionsService'
import { ActionPlanAppointment } from '../../models/appointment'
import InterventionProgressPresenter from './interventionProgressPresenter'
import InterventionProgressView from './interventionProgressView'
import FindStartPresenter from './findStartPresenter'
import DashboardView from './dashboardView'
import DashboardPresenter, { PPDashboardType } from './dashboardPresenter'
import FindStartView from './findStartView'
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
import FileUtils from '../../utils/fileUtils'
import DraftsService from '../../services/draftsService'
import config from '../../config'
import DeliusOfficeLocationFilter from '../../services/deliusOfficeLocationFilter'
import ReferenceDataService from '../../services/referenceDataService'
import SentReferral from '../../models/sentReferral'
import ActionPlan from '../../models/actionPlan'
import ActionPlanUtils from '../../utils/actionPlanUtils'
import UserDataService from '../../services/userDataService'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import PrisonAndSecureChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'

export default class ProbationPractitionerReferralsController {
  private readonly deliusOfficeLocationFilter: DeliusOfficeLocationFilter

  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService,
    private readonly draftsService: DraftsService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly userDataService: UserDataService,
    private readonly prisonAndSecureChildAgencyService: PrisonAndSecureChildAgencyService,
    private readonly ramDeliusApiService: RamDeliusApiService
  ) {
    this.deliusOfficeLocationFilter = new DeliusOfficeLocationFilter(referenceDataService)
  }

  async showOpenCases(req: Request, res: Response): Promise<void> {
    const pageSize = config.dashboards.probationPractitioner.openCases
    await this.showDashboard(req, res, { completed: false, cancelled: false }, 'Open cases', 'ppOpenCases', pageSize)
  }

  async showUnassignedCases(req: Request, res: Response): Promise<void> {
    const pageSize = config.dashboards.probationPractitioner.unassignedCases
    await this.showDashboard(
      req,
      res,
      { completed: false, unassigned: true },
      'Unassigned cases',
      'ppUnassignedCases',
      pageSize
    )
  }

  async showCompletedCases(req: Request, res: Response): Promise<void> {
    const pageSize = config.dashboards.probationPractitioner.completedCases
    await this.showDashboard(
      req,
      res,
      { completed: true, cancelled: false },
      'Completed cases',
      'ppCompletedCases',
      pageSize
    )
  }

  async showCancelledCases(req: Request, res: Response): Promise<void> {
    const pageSize = config.dashboards.probationPractitioner.cancelledCases
    await this.showDashboard(req, res, { cancelled: true }, 'Cancelled cases', 'ppCancelledCases', pageSize)
  }

  private async showDashboard(
    req: Request,
    res: Response,
    getSentReferralsFilterParams: GetSentReferralsFilterParams,
    dashboardType: PPDashboardType,
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
      config.userData.ppDashboardSortOrder.storageDurationInSeconds,
      tablePersistentId,
      DashboardPresenter.headingsAndSortFields.map(it => it.sortField).filter(it => it) as string[],
      'serviceuserlastname,ASC',
      'sentat,ASC'
    )

    const paginationQuery = {
      page: ControllerUtils.parseQueryParamAsPositiveInteger(req, 'page') ?? undefined,
      size: pageSize,
      sort,
    }
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

    const presenter = new DashboardPresenter(
      cases,
      res.locals.user,
      dashboardType,
      tablePersistentId,
      sort[0],
      disablePlannedDowntimeNotification,
      req.session.dashboardOriginPage
    )

    const view = new DashboardView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, null, 'probation-practitioner')
  }

  async showFindStartPage(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUserToken(accessToken)

    const structuredInterventionsFileDownloadPaths = {
      xlsx: 'assets/downloads/Structured interventions list v1_3_4.xlsx',
    }

    const downloadFileSize = await FileUtils.fileSize(structuredInterventionsFileDownloadPaths.xlsx)
    const presenter = new FindStartPresenter(
      existingDraftReferrals,
      structuredInterventionsFileDownloadPaths,
      downloadFileSize,
      res.locals.user
    )

    const view = new FindStartView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, null, 'probation-practitioner')
  }

  async showInterventionProgress(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id } = req.params
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
    const supplierAssessmentPromise = this.interventionsService.getSupplierAssessment(accessToken, sentReferral.id)
    const assigneePromise = sentReferral.assignedTo
      ? this.hmppsAuthService.getSPUserByUsername(accessToken, sentReferral.assignedTo.username)
      : Promise.resolve(null)

    const [intervention, actionPlan, approvedActionPlanSummaries, serviceUser, supplierAssessment, assignee] =
      await Promise.all([
        interventionPromise,
        actionPlanPromise,
        this.interventionsService.getApprovedActionPlanSummaries(accessToken, id),
        serviceUserPromise,
        supplierAssessmentPromise,
        assigneePromise,
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

    const presenter = new InterventionProgressPresenter(
      sentReferral,
      intervention,
      actionPlanAppointments,
      actionPlan,
      approvedActionPlanSummaries,
      supplierAssessment,
      assignee,
      req.session.dashboardOriginPage
    )
    const view = new InterventionProgressView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      approvedActionPlanSummaries,
      prisonAndSecureChildAgency,
      deliusResponsibleOfficer,
      prisonerDetails,
    ] = await Promise.all([
      this.interventionsService.getIntervention(accessToken, sentReferral.referral.interventionId),
      this.ramDeliusApiService.getUserByUsername(sentReferral.sentBy.username),
      this.ramDeliusApiService.getConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId),
      this.assessRisksAndNeedsService.getSupplementaryRiskInformation(sentReferral.supplementaryRiskId, accessToken),
      this.assessRisksAndNeedsService.getRiskSummary(crn, accessToken),
      this.interventionsService.getApprovedActionPlanSummaries(accessToken, req.params.id),
      this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(accessToken),
      this.ramDeliusApiService.getResponsibleOfficer(sentReferral.referral.serviceUser.crn),
      this.interventionsService.getPrisonerDetails(accessToken, crn),
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
      caseConviction.conviction,
      riskInformation,
      sentBy,
      prisonAndSecureChildAgency,
      assignee,
      null,
      'probation-practitioner',
      false,
      caseConviction.caseDetail,
      riskSummary,
      deliusResponsibleOfficer,
      prisonerDetails,
      req.query.detailsUpdated === 'true',
      req.session.dashboardOriginPage,
      !!approvedActionPlanSummaries.length
    )
    const view = new ShowReferralView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, caseConviction.caseDetail, 'probation-practitioner')
  }

  async viewEndOfServiceReport(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.interventionsService.getServiceCategories(
      accessToken,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportPresenter(
      referral,
      endOfServiceReport,
      serviceCategories,
      'probation-practitioner'
    )
    const view = new EndOfServiceReportView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    return this.renderActionPlan(req, res, sentReferral, actionPlan, formValidationError)
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

    return this.renderActionPlan(req, res, sentReferral, actionPlan)
  }

  private async renderActionPlan(
    req: Request,
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
      this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
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
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    await ControllerUtils.renderWithLayout(
      req,
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
      serviceUser,
      'probation-practitioner'
    )
  }

  async showWhatsNew(req: Request, res: Response): Promise<void> {
    await ControllerUtils.renderWithLayout(
      req,
      res,
      {
        renderArgs: [
          'probationPractitionerReferrals/whatsNew',
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
      'probation-practitioner'
    )
  }
}
