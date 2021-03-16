import { Request, Response } from 'express'
import querystring from 'querystring'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService from '../../services/interventionsService'
import HmppsAuthClient, { AuthUser } from '../../data/hmppsAuthClient'
import CheckAssignmentPresenter from './checkAssignmentPresenter'
import CheckAssignmentView from './checkAssignmentView'
import DashboardPresenter from './dashboardPresenter'
import DashboardView from './dashboardView'
import ShowReferralPresenter from './showReferralPresenter'
import ShowReferralView from './showReferralView'
import AssignmentConfirmationView from './assignmentConfirmationView'
import AssignmentConfirmationPresenter from './assignmentConfirmationPresenter'
import { FormValidationError } from '../../utils/formValidationError'
import errorMessages from '../../utils/errorMessages'
import AddActionPlanActivitiesPresenter from './addActionPlanActivitiesPresenter'
import AddActionPlanActivitiesView from './addActionPlanActivitiesView'
import InterventionProgressView from './interventionProgressView'
import InterventionProgressPresenter from './interventionProgressPresenter'

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
        : await this.hmppsAuthClient.getSPUserByUsername(res.locals.user.token, sentReferral.assignedTo.username)

    let formError: FormValidationError | null = null
    if (assignee === null) {
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
    }

    const presenter = new ShowReferralPresenter(sentReferral, serviceCategory, sentBy, serviceUser, assignee, formError)
    const view = new ShowReferralView(presenter)

    res.render(...view.renderArgs)
  }

  async showInterventionProgress(req: Request, res: Response): Promise<void> {
    const sentReferral = await this.interventionsService.getSentReferral(res.locals.user.token, req.params.id)
    const serviceUserPromise = this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const serviceCategoryPromise = this.interventionsService.getServiceCategory(
      res.locals.user.token,
      sentReferral.referral.serviceCategoryId
    )
    const actionPlanPromise =
      sentReferral.actionPlanId === null
        ? Promise.resolve(null)
        : this.interventionsService.getActionPlan(res.locals.user.token, sentReferral.actionPlanId)

    const [serviceCategory, actionPlan, serviceUser] = await Promise.all([
      serviceCategoryPromise,
      actionPlanPromise,
      serviceUserPromise,
    ])

    const presenter = new InterventionProgressPresenter(sentReferral, serviceCategory, actionPlan, serviceUser)
    const view = new InterventionProgressView(presenter)

    res.render(...view.renderArgs)
  }

  async checkAssignment(req: Request, res: Response): Promise<void> {
    const email = req.query.email as string

    if (email === undefined || email === '') {
      return res.redirect(
        `/service-provider/referrals/${req.params.id}/details?${querystring.stringify({
          error: errorMessages.assignReferral.emailEmpty,
        })}`
      )
    }

    let assignee: AuthUser
    const token = await this.hmppsAuthClient.getApiClientToken()

    try {
      assignee = await this.hmppsAuthClient.getSPUserByEmailAddress(token, email)
    } catch (e) {
      return res.redirect(
        `/service-provider/referrals/${req.params.id}/details?${querystring.stringify({
          error: errorMessages.assignReferral.emailNotFound,
        })}`
      )
    }

    const referral = await this.interventionsService.getSentReferral(res.locals.user.token, req.params.id)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.referral.serviceCategoryId
    )

    const presenter = new CheckAssignmentPresenter(referral.id, assignee, email, serviceCategory)
    const view = new CheckAssignmentView(presenter)

    return res.render(...view.renderArgs)
  }

  async assignReferral(req: Request, res: Response): Promise<void> {
    const { email } = req.body
    if (email === undefined || email === null || email === '') {
      res.sendStatus(400)
      return
    }

    const assignee = await this.hmppsAuthClient.getSPUserByEmailAddress(res.locals.user.token, email)

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
      this.hmppsAuthClient.getSPUserByUsername(res.locals.user.token, referral.assignedTo.username),
      this.interventionsService.getServiceCategory(res.locals.user.token, referral.referral.serviceCategoryId),
    ])

    const presenter = new AssignmentConfirmationPresenter(referral, serviceCategory, assignee)
    const view = new AssignmentConfirmationView(presenter)

    res.render(...view.renderArgs)
  }

  async createDraftActionPlan(req: Request, res: Response): Promise<void> {
    const draftActionPlan = await this.interventionsService.createDraftActionPlan(res.locals.user.token, req.params.id)

    res.redirect(303, `/service-provider/action-plan/${draftActionPlan.id}/add-activities`)
  }

  async addActivitiesToActionPlan(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getDraftActionPlan(res.locals.user.token, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(res.locals.user.token, actionPlan.referralId)

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      sentReferral.referral.serviceCategoryId
    )

    const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategory)
    const view = new AddActionPlanActivitiesView(presenter)

    res.render(...view.renderArgs)
  }
}
