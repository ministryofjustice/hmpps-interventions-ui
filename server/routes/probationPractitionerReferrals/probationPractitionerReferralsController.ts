import { Request, Response } from 'express'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService, { ActionPlanAppointment } from '../../services/interventionsService'
import InterventionProgressPresenter from './interventionProgressPresenter'
import InterventionProgressView from './interventionProgressView'
import FindStartPresenter from './findStartPresenter'
import FindStartView from './findStartView'

export default class ProbationPractitionerReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

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
}
