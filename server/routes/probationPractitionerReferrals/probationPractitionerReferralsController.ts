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
}
