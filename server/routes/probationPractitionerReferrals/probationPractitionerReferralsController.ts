import { Request, Response } from 'express'
import createError from 'http-errors'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService from '../../services/interventionsService'
import { ActionPlanAppointment } from '../../models/appointment'
import InterventionProgressPresenter from './interventionProgressPresenter'
import InterventionProgressView from './interventionProgressView'
import FindStartPresenter from './findStartPresenter'
import MyCasesView from './myCasesView'
import MyCasesPresenter from './myCasesPresenter'
import FindStartView from './findStartView'
import SubmittedFeedbackPresenter from '../shared/appointment/feedback/submittedFeedbackPresenter'
import SubmittedFeedbackView from '../shared/appointment/feedback/submittedFeedbackView'
import ReferralCancellationReasonPresenter from './referralCancellationReasonPresenter'
import ReferralCancellationReasonView from './referralCancellationReasonView'
import EndOfServiceReportPresenter from '../probation-practitioner/end-of-service-report/endOfServiceReportPresenter'
import EndOfServiceReportView from '../probation-practitioner/end-of-service-report/endOfServiceReportView'
import ReferralCancellationCheckAnswersPresenter from './referralCancellationCheckAnswersPresenter'
import ReferralCancellationCheckAnswersView from './referralCancellationCheckAnswersView'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralCancellationReasonForm from './referralCancellationReasonForm'
import ReferralCancellationConfirmationView from './referralCancellationConfirmationView'
import ReferralCancellationConfirmationPresenter from './referralCancellationConfirmationPresenter'
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
import DraftCancellationData from './draftCancellationData'
import config from '../../config'
import AppointmentSummary from '../appointments/appointmentSummary'
import DeliusOfficeLocationFilter from '../../services/deliusOfficeLocationFilter'
import ReferenceDataService from '../../services/referenceDataService'

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

  async showMyCases(req: Request, res: Response): Promise<void> {
    const cases = await this.interventionsService.getSentReferralsForUserToken(res.locals.user.token.accessToken)

    const dedupedInterventionIds = Array.from(new Set(cases.map(referral => referral.referral.interventionId)))
    const interventions = await Promise.all(
      dedupedInterventionIds.map(id => this.interventionsService.getIntervention(res.locals.user.token.accessToken, id))
    )

    const presenter = new MyCasesPresenter(cases, interventions)
    const view = new MyCasesView(presenter)
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
      downloadFileSize
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

  async startCancellation(req: Request, res: Response): Promise<void> {
    const draftCancellation = await this.draftsService.createDraft<DraftCancellationData>(
      'cancellation',
      {
        cancellationReason: null,
        cancellationComments: null,
      },
      { userId: res.locals.user.userId }
    )
    res.redirect(`/probation-practitioner/referrals/${req.params.id}/cancellation/${draftCancellation.id}/reason`)
  }

  async backwardsCompatibilityUpdateCancellationReason(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const data = await new ReferralCancellationReasonForm(req).data()

    let formError: FormValidationError | null = null

    if (req.method === 'POST') {
      if (!data.error) {
        const draftCancellation = await this.draftsService.createDraft<DraftCancellationData>(
          'cancellation',
          data.paramsForUpdate,
          { userId: res.locals.user.userId }
        )

        return res.redirect(
          `/probation-practitioner/referrals/${referralId}/cancellation/${draftCancellation.id}/check-your-answers`
        )
      }

      res.status(400)
      formError = data.error
    }

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

    // We don’t use this draft, other than to pass it to the presenter for rendering
    // (remember this controller action is only temporary)
    const draftCancellation = await this.draftsService.createDraft<DraftCancellationData>(
      'cancellation',
      {
        cancellationReason: null,
        cancellationComments: null,
      },
      { userId: res.locals.user.userId }
    )

    const presenter = new ReferralCancellationReasonPresenter(
      draftCancellation,
      sentReferral,
      intervention,
      serviceUser,
      cancellationReasons,
      formError
    )

    await this.draftsService.deleteDraft(draftCancellation.id, { userId: res.locals.user.userId })

    const view = new ReferralCancellationReasonView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  private async fetchDraftCancellationOrRenderMessage(req: Request, res: Response) {
    return ControllerUtils.fetchDraftOrRenderMessage<DraftCancellationData>(req, res, this.draftsService, {
      idParamName: 'draftCancellationId',
      notFoundUserMessage:
        'Too much time has passed since you started cancelling this referral. Your answers have not been saved, and you will need to start again.',
      typeName: 'cancellation',
    })
  }

  async editCancellationReason(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const fetchResult = await this.fetchDraftCancellationOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftCancellation = fetchResult.draft

    const data = await new ReferralCancellationReasonForm(req).data()

    let formError: FormValidationError | null = null

    if (req.method === 'POST') {
      if (!data.error) {
        await this.draftsService.updateDraft<DraftCancellationData>(draftCancellation.id, data.paramsForUpdate, {
          userId: res.locals.user.userId,
        })

        res.redirect(
          `/probation-practitioner/referrals/${referralId}/cancellation/${draftCancellation.id}/check-your-answers`
        )
        return
      }

      res.status(400)
      formError = data.error
    }

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

    const presenter = new ReferralCancellationReasonPresenter(
      draftCancellation,
      sentReferral,
      intervention,
      serviceUser,
      cancellationReasons,
      formError
    )
    const view = new ReferralCancellationReasonView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async cancellationCheckAnswers(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const fetchResult = await this.fetchDraftCancellationOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftCancellation = fetchResult.draft

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)

    const presenter = new ReferralCancellationCheckAnswersPresenter(req.params.id, draftCancellation.id)
    const view = new ReferralCancellationCheckAnswersView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async backwardsCompatibilitySubmitCancellation(req: Request, res: Response): Promise<void> {
    const cancellationReason = req.body['cancellation-reason']
    const cancellationComments = req.body['cancellation-comments']

    await this.submitCancellationWithValues(cancellationReason, cancellationComments, req, res)
  }

  async submitCancellation(req: Request, res: Response): Promise<void> {
    const fetchResult = await this.fetchDraftCancellationOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftCancellation = fetchResult.draft

    const { cancellationReason, cancellationComments } = draftCancellation.data

    await this.submitCancellationWithValues(cancellationReason, cancellationComments, req, res)

    await this.draftsService.deleteDraft(draftCancellation.id, { userId: res.locals.user.userId })
  }

  async submitCancellationWithValues(
    cancellationReason: string | null,
    cancellationComments: string | null,
    req: Request,
    res: Response
  ): Promise<void> {
    if (cancellationReason === null) {
      throw new Error('Got unexpectedly null cancellationReason')
    }
    if (cancellationComments === null) {
      throw new Error('Got unexpectedly null cancellationComments')
    }

    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    await this.interventionsService.endReferral(accessToken, referralId, cancellationReason, cancellationComments)

    return res.redirect(`/probation-practitioner/referrals/${referralId}/cancellation/confirmation`)
  }

  async showCancellationConfirmationPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)

    const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, intervention)
    const view = new ReferralCancellationConfirmationView(presenter)

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
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportPresenter(referral, endOfServiceReport, serviceCategories)
    const view = new EndOfServiceReportView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewActionPlan(req: Request, res: Response): Promise<void> {
    await this.renderViewActionPlan(req, res)
  }

  private async renderViewActionPlan(
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

    const [serviceCategories, actionPlan, serviceUser, actionPlanVersions] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId),
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
      return this.renderViewActionPlan(req, res, confirmApprovalResult.error)
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
