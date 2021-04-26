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
import ReferralCancellationPresenter from './referralCancellationPresenter'
import ReferralCancellationView from './referralCancellationView'
import EndOfServiceReportPresenter from './endOfServiceReportPresenter'
import EndOfServiceReportView from './endOfServiceReportView'
import ReferralCancellationForm from './referralCancellationForm'
import { FormValidationError } from '../../utils/formValidationError'

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
    res.render(...view.renderArgs)
  }

  async showFindStartPage(req: Request, res: Response): Promise<void> {
    const { token, userId } = res.locals.user

    const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUser(token.accessToken, userId)
    const presenter = new FindStartPresenter(existingDraftReferrals)
    const view = new FindStartView(presenter)

    res.render(...view.renderArgs)
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

    res.render(...view.renderArgs)
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

    return res.render(...view.renderArgs)
  }

  async showReferralCancellationPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      accessToken,
      sentReferral.referral.serviceCategoryId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

    const presenter = new ReferralCancellationPresenter(sentReferral, serviceCategory, serviceUser, cancellationReasons)
    const view = new ReferralCancellationView(presenter)

    return res.render(...view.renderArgs)
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

    res.render(...view.renderArgs)
  }

  async redirectToCancellationCheckAnswersPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    let formError: FormValidationError | null = null

    const data = await new ReferralCancellationForm(req).data()

    if (data.error) {
      res.status(400)
      formError = data.error
    } else {
      const referralId = req.params.id

      return res.render('probationPractitionerReferrals/referralCancellationCheckAnswers', {
        ...data.paramsForUpdate,
        href: `/probation-practitioner/referrals/${referralId}/cancellation/submit`,
      })
    }

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      accessToken,
      sentReferral.referral.serviceCategoryId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

    const presenter = new ReferralCancellationPresenter(
      sentReferral,
      serviceCategory,
      serviceUser,
      cancellationReasons,
      formError
    )
    const view = new ReferralCancellationView(presenter)

    return res.render(...view.renderArgs)
  }

  async cancelReferral(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const cancellationReason = req.body['cancellation-reason']
    const cancellationComments = req.body['cancellation-comments']

    await this.interventionsService.cancelReferral(accessToken, referralId, cancellationReason, cancellationComments)

    return res.redirect(`/probation-practitioner/referrals/${referralId}/cancellation/confirmation`)
  }

  async showCancellationConfirmationPage(req: Request, res: Response): Promise<void> {
    res.render('probationPractitionerReferrals/referralCancellationConfirmation')
  }
}
