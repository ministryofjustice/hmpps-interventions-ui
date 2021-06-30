import { Request, Response } from 'express'
import createError from 'http-errors'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService from '../../services/interventionsService'
import { ActionPlanAppointment } from '../../models/actionPlan'
import InterventionProgressPresenter from './interventionProgressPresenter'
import InterventionProgressView from './interventionProgressView'
import FindStartPresenter from './findStartPresenter'
import MyCasesView from './myCasesView'
import MyCasesPresenter from './myCasesPresenter'
import FindStartView from './findStartView'
import SubmittedPostSessionFeedbackPresenter from '../shared/action-plan/appointment/post-session-feedback/submittedPostSessionFeedbackPresenter'
import SubmittedPostSessionFeedbackView from '../shared/action-plan/appointment/post-session-feedback/submittedPostSessionFeedbackView'
import ReferralCancellationReasonPresenter from './referralCancellationReasonPresenter'
import ReferralCancellationReasonView from './referralCancellationReasonView'
import EndOfServiceReportPresenter from './endOfServiceReportPresenter'
import EndOfServiceReportView from './endOfServiceReportView'
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

export default class ProbationPractitionerReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService
  ) {}

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
    const presenter = new FindStartPresenter(existingDraftReferrals)
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
    const [intervention, sentBy, expandedServiceUser, conviction, riskInformation, riskSummary] = await Promise.all([
      this.interventionsService.getIntervention(accessToken, sentReferral.referral.interventionId),
      this.communityApiService.getUserByUsername(sentReferral.sentBy.username),
      this.communityApiService.getExpandedServiceUserByCRN(crn),
      this.communityApiService.getConvictionById(crn, sentReferral.referral.relevantSentenceId),
      this.assessRisksAndNeedsService.getSupplementaryRiskInformation(sentReferral.supplementaryRiskId, accessToken),
      this.assessRisksAndNeedsService.getRiskSummary(crn, accessToken),
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
      riskSummary
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

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    if (!referral.assignedTo) {
      throw new Error('Referral has not yet been assigned to a caseworker')
    }

    const presenter = new SubmittedPostSessionFeedbackPresenter(currentAppointment, serviceUser, referral.assignedTo)
    const view = new SubmittedPostSessionFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async showReferralCancellationReasonPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

    const presenter = new ReferralCancellationReasonPresenter(
      sentReferral,
      intervention,
      serviceUser,
      cancellationReasons
    )
    const view = new ReferralCancellationReasonView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitFormAndShowCancellationCheckAnswersPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    let formError: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)

    const data = await new ReferralCancellationReasonForm(req).data()

    if (data.error) {
      res.status(400)
      formError = data.error

      const intervention = await this.interventionsService.getIntervention(
        accessToken,
        sentReferral.referral.interventionId
      )
      const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

      const presenter = new ReferralCancellationReasonPresenter(
        sentReferral,
        intervention,
        serviceUser,
        cancellationReasons,
        formError
      )
      const view = new ReferralCancellationReasonView(presenter)

      return ControllerUtils.renderWithLayout(res, view, serviceUser)
    }

    const { cancellationReason, cancellationComments } = data.paramsForUpdate

    const presenter = new ReferralCancellationCheckAnswersPresenter(
      req.params.id,
      cancellationReason,
      cancellationComments
    )

    const view = new ReferralCancellationCheckAnswersView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async cancelReferral(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const cancellationReason = req.body['cancellation-reason']
    const cancellationComments = req.body['cancellation-comments']

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

    const [actionPlan, serviceUser] = await Promise.all([
      this.interventionsService.getActionPlan(accessToken, sentReferral.actionPlanId),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ActionPlanPresenter(sentReferral, actionPlan, 'probation-practitioner', formValidationError)
    const view = new ActionPlanView(presenter, false)
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
      throw new Error('Attempting to view supplier assessment without a current appointment')
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment, assignee, {
      includeAssignee: true,
      readonly: true,
    })
    const view = new SupplierAssessmentAppointmentView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }
}
