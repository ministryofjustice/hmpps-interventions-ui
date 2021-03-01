import { Request, Response } from 'express'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService from '../../services/interventionsService'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import CheckAssignmentPresenter from './checkAssignmentPresenter'
import CheckAssignmentView from './checkAssignmentView'
import DashboardPresenter from './dashboardPresenter'
import DashboardView from './dashboardView'
import ShowReferralPresenter from './showReferralPresenter'
import ShowReferralView from './showReferralView'
import AssignmentConfirmationView from './assignmentConfirmationView'
import AssignmentConfirmationPresenter from './assignmentConfirmationPresenter'

export default class ServiceProviderReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthClient: HmppsAuthClient
  ) {}

  async showDashboard(req: Request, res: Response): Promise<void> {
    const referrals = await this.interventionsService.getSentReferrals(res.locals.user.token)

    const dedupedServiceCategoryIds = Array.from(
      new Set(referrals.map(referral => referral.referral.serviceCategoryId))
    )
    const serviceCategories = await Promise.all(
      dedupedServiceCategoryIds.map(id => this.interventionsService.getServiceCategory(res.locals.user.token, id))
    )

    const presenter = new DashboardPresenter(referrals, serviceCategories)
    const view = new DashboardView(presenter)

    res.render(...view.renderArgs)
  }

  async showReferral(req: Request, res: Response): Promise<void> {
    const sentReferral = await this.interventionsService.getSentReferral(res.locals.user.token, req.params.id)
    const [serviceCategory, sentBy, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token, sentReferral.referral.serviceCategoryId),
      this.communityApiService.getUserByUsername(sentReferral.sentBy.username),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const assignee =
      sentReferral.assignedTo === null
        ? null
        : await this.hmppsAuthClient.getUserByUsername(res.locals.user.token, sentReferral.assignedTo.username)

    const presenter = new ShowReferralPresenter(sentReferral, serviceCategory, sentBy, serviceUser, assignee)
    const view = new ShowReferralView(presenter)

    res.render(...view.renderArgs)
  }

  async checkAssignment(req: Request, res: Response): Promise<void> {
    // TODO IC-1180 - Validation: presence, and that it exists in HMPPS Auth
    const email = req.query.email as string
    const assigneePromise = this.hmppsAuthClient.getUserByEmailAddress(res.locals.user.token, email)
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token, req.params.id)

    const [assignee, serviceCategory] = await Promise.all([
      assigneePromise,
      this.interventionsService.getServiceCategory(res.locals.user.token, referral.referral.serviceCategoryId),
    ])

    const presenter = new CheckAssignmentPresenter(referral.id, assignee, email, serviceCategory)
    const view = new CheckAssignmentView(presenter)

    res.render(...view.renderArgs)
  }

  async assignReferral(req: Request, res: Response): Promise<void> {
    // TODO IC-1180 - Validation: presence
    const { email } = req.body
    const assignee = await this.hmppsAuthClient.getUserByEmailAddress(res.locals.user.token, email)

    await this.interventionsService.assignSentReferral(res.locals.user.token, req.params.id, {
      username: assignee.username,
      userId: assignee.userId,
      authSource: 'auth',
    })

    res.redirect(`/service-provider/referrals/${req.params.id}/assignment/confirmation`)
  }

  async confirmAssignment(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token, req.params.id)

    if (referral.assignedTo === null) {
      throw new Error('Can’t view confirmation of assignment, as referral isn’t assigned.')
    }

    const [assignee, serviceCategory] = await Promise.all([
      this.hmppsAuthClient.getUserByUsername(res.locals.user.token, referral.assignedTo.username),
      this.interventionsService.getServiceCategory(res.locals.user.token, referral.referral.serviceCategoryId),
    ])

    const presenter = new AssignmentConfirmationPresenter(referral, serviceCategory, assignee)
    const view = new AssignmentConfirmationView(presenter)

    res.render(...view.renderArgs)
  }
}
