import { Request, Response } from 'express'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService, { ActionPlanAppointment } from '../../services/interventionsService'
import InterventionProgressPresenter from './interventionProgressPresenter'
import InterventionProgressView from './interventionProgressView'
import FindStartPresenter from './findStartPresenter'
import MyCasesView from './myCasesView'
import MyCasesPresenter from './myCasesPresenter'
import FindStartView from './findStartView'
import AuthUtils from '../../utils/authUtils'
import SubmittedPostSessionFeedbackPresenter from '../shared/submittedPostSessionFeedbackPresenter'
import SubmittedPostSessionFeedbackView from '../shared/submittedPostSessionFeedbackView'
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

export default class ProbationPractitionerReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

  async showMyCases(req: Request, res: Response): Promise<void> {
    const userId = AuthUtils.getProbationPractitionerUserId(res.locals.user)
    const cases = await this.interventionsService.getReferralsSentByProbationPractitioner(
      res.locals.user.token.accessToken,
      userId
    )

    const dedupedServiceCategoryIds = Array.from(new Set(cases.map(referral => referral.referral.serviceCategoryId)))
    const serviceCategories = await Promise.all(
      dedupedServiceCategoryIds.map(id =>
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
      )
    )

    const presenter = new MyCasesPresenter(cases, serviceCategories)
    const view = new MyCasesView(presenter)
    ControllerUtils.renderWithLayout(res, view)
  }

  async showFindStartPage(req: Request, res: Response): Promise<void> {
    const { token, userId } = res.locals.user

    const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUser(token.accessToken, userId)
    const presenter = new FindStartPresenter(existingDraftReferrals)
    const view = new FindStartView(presenter)

    ControllerUtils.renderWithLayout(res, view)
  }

  async showInterventionProgress(req: Request, res: Response): Promise<void> {
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      req.params.id
    )
    const serviceUserPromise = this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const serviceCategoryPromise = this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
      sentReferral.referral.serviceCategoryId
    )
    const actionPlanPromise =
      sentReferral.actionPlanId === null
        ? Promise.resolve(null)
        : this.interventionsService.getActionPlan(res.locals.user.token.accessToken, sentReferral.actionPlanId)

    const [serviceCategory, actionPlan, serviceUser] = await Promise.all([
      serviceCategoryPromise,
      actionPlanPromise,
      serviceUserPromise,
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
      serviceCategory,
      serviceUser,
      actionPlanAppointments
    )
    const view = new InterventionProgressView(presenter)

    ControllerUtils.renderWithLayout(res, view)
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

    return ControllerUtils.renderWithLayout(res, view)
  }

  async showReferralCancellationReasonPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      accessToken,
      sentReferral.referral.serviceCategoryId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

    const presenter = new ReferralCancellationReasonPresenter(
      sentReferral,
      serviceCategory,
      serviceUser,
      cancellationReasons
    )
    const view = new ReferralCancellationReasonView(presenter)

    return ControllerUtils.renderWithLayout(res, view)
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

      const serviceCategory = await this.interventionsService.getServiceCategory(
        accessToken,
        sentReferral.referral.serviceCategoryId
      )
      const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

      const presenter = new ReferralCancellationReasonPresenter(
        sentReferral,
        serviceCategory,
        serviceUser,
        cancellationReasons,
        formError
      )
      const view = new ReferralCancellationReasonView(presenter)

      return ControllerUtils.renderWithLayout(res, view)
    }

    const { cancellationReason, cancellationComments } = data.paramsForUpdate

    const presenter = new ReferralCancellationCheckAnswersPresenter(
      req.params.id,
      serviceUser,
      cancellationReason,
      cancellationComments
    )

    const view = new ReferralCancellationCheckAnswersView(presenter)

    return ControllerUtils.renderWithLayout(res, view)
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
    const serviceCategory = await this.interventionsService.getServiceCategory(
      accessToken,
      sentReferral.referral.serviceCategoryId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)

    const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, serviceCategory, serviceUser)
    const view = new ReferralCancellationConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view)
  }

  async viewEndOfServiceReport(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      accessToken,
      referral.referral.serviceCategoryId
    )

    const presenter = new EndOfServiceReportPresenter(referral, endOfServiceReport, serviceCategory)
    const view = new EndOfServiceReportView(presenter)

    ControllerUtils.renderWithLayout(res, view)
  }
}
