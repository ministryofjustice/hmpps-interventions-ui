import { Request, Response } from 'express'
import querystring from 'querystring'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService, { ActionPlanAppointment } from '../../services/interventionsService'
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
import AddActionPlanActivitiesForm from './addActionPlanActivitiesForm'
import FinaliseActionPlanActivitiesForm from './finaliseActionPlanActivitiesForm'
import ReviewActionPlanPresenter from './reviewActionPlanPresenter'
import ReviewActionPlanView from './reviewActionPlanView'
import ActionPlanConfirmationPresenter from './actionPlanConfirmationPresenter'
import ActionPlanConfirmationView from './actionPlanConfirmationView'
import AddActionPlanNumberOfSessionsView from './actionPlanNumberOfSessionsView'
import AddActionPlanNumberOfSessionsPresenter from './actionPlanNumberOfSessionsPresenter'
import ActionPlanNumberOfSessionsForm from './actionPlanNumberOfSessionsForm'
import EditSessionPresenter from './editSessionPresenter'
import EditSessionView from './editSessionView'
import EditSessionForm from './editSessionForm'
import PostSessionAttendanceFeedbackView from './postSessionAttendanceFeedbackView'
import PostSessionAttendanceFeedbackPresenter from './postSessionAttendanceFeedbackPresenter'
import PostSessionAttendanceFeedbackForm from './postSessionAttendanceFeedbackForm'
import PostSessionFeedbackConfirmationPresenter from './postSessionFeedbackConfirmationPresenter'
import PostSessionFeedbackConfirmationView from './postSessionFeedbackConfirmationView'
import PostSessionBehaviourFeedbackPresenter from './postSessionBehaviourFeedbackPresenter'
import PostSessionBehaviourFeedbackView from './postSessionBehaviourFeedbackView'
import PostSessionBehaviourFeedbackForm from './postSessionBehaviourFeedbackForm'

export default class ServiceProviderReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthClient: HmppsAuthClient
  ) {}

  async showDashboard(req: Request, res: Response): Promise<void> {
    const referrals = await this.interventionsService.getSentReferrals(res.locals.user.token.accessToken)

    const dedupedServiceCategoryIds = Array.from(
      new Set(referrals.map(referral => referral.referral.serviceCategoryId))
    )
    const serviceCategories = await Promise.all(
      dedupedServiceCategoryIds.map(id =>
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
      )
    )

    const presenter = new DashboardPresenter(referrals, serviceCategories)
    const view = new DashboardView(presenter)

    res.render(...view.renderArgs)
  }

  async showReferral(req: Request, res: Response): Promise<void> {
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      req.params.id
    )
    const [serviceCategory, sentBy, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(
        res.locals.user.token.accessToken,
        sentReferral.referral.serviceCategoryId
      ),
      this.communityApiService.getUserByUsername(sentReferral.sentBy.username),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const assignee =
      sentReferral.assignedTo === null
        ? null
        : await this.hmppsAuthClient.getSPUserByUsername(
            res.locals.user.token.accessToken,
            sentReferral.assignedTo.username
          )

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
      actionPlan,
      serviceUser,
      actionPlanAppointments
    )
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

    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
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

    const assignee = await this.hmppsAuthClient.getSPUserByEmailAddress(res.locals.user.token.accessToken, email)

    await this.interventionsService.assignSentReferral(res.locals.user.token.accessToken, req.params.id, {
      username: assignee.username,
      userId: assignee.userId,
      authSource: 'auth',
    })

    res.redirect(`/service-provider/referrals/${req.params.id}/assignment/confirmation`)
  }

  async confirmAssignment(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.assignedTo === null) {
      throw new Error('Can’t view confirmation of assignment, as referral isn’t assigned.')
    }

    const [assignee, serviceCategory] = await Promise.all([
      this.hmppsAuthClient.getSPUserByUsername(res.locals.user.token.accessToken, referral.assignedTo.username),
      this.interventionsService.getServiceCategory(
        res.locals.user.token.accessToken,
        referral.referral.serviceCategoryId
      ),
    ])

    const presenter = new AssignmentConfirmationPresenter(referral, serviceCategory, assignee)
    const view = new AssignmentConfirmationView(presenter)

    res.render(...view.renderArgs)
  }

  async createDraftActionPlan(req: Request, res: Response): Promise<void> {
    const draftActionPlan = await this.interventionsService.createDraftActionPlan(
      res.locals.user.token.accessToken,
      req.params.id
    )

    res.redirect(303, `/service-provider/action-plan/${draftActionPlan.id}/add-activities`)
  }

  async showActionPlanAddActivitiesForm(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
      sentReferral.referral.serviceCategoryId
    )

    const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategory, actionPlan)
    const view = new AddActionPlanActivitiesView(presenter)

    res.render(...view.renderArgs)
  }

  async addActivityToActionPlan(req: Request, res: Response): Promise<void> {
    const form = await AddActionPlanActivitiesForm.createForm(req)

    if (form.isValid) {
      await this.interventionsService.updateDraftActionPlan(
        res.locals.user.token.accessToken,
        req.params.id,
        form.activityParamsForUpdate
      )

      res.redirect(`/service-provider/action-plan/${req.params.id}/add-activities`)
      return
    }

    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
      sentReferral.referral.serviceCategoryId
    )

    const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategory, actionPlan, form.errors)
    const view = new AddActionPlanActivitiesView(presenter)

    res.status(400)
    res.render(...view.renderArgs)
  }

  async finaliseActionPlanActivities(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
      sentReferral.referral.serviceCategoryId
    )

    const form = new FinaliseActionPlanActivitiesForm(sentReferral, actionPlan, serviceCategory)

    if (form.isValid) {
      res.redirect(`/service-provider/action-plan/${actionPlan.id}/number-of-sessions`)
    } else {
      const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategory, actionPlan, form.errors)
      const view = new AddActionPlanActivitiesView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async reviewActionPlan(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
      sentReferral.referral.serviceCategoryId
    )

    const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategory, actionPlan)
    const view = new ReviewActionPlanView(presenter)

    res.render(...view.renderArgs)
  }

  async submitActionPlan(req: Request, res: Response): Promise<void> {
    await this.interventionsService.submitActionPlan(res.locals.user.token.accessToken, req.params.id)
    res.redirect(`/service-provider/action-plan/${req.params.id}/confirmation`)
  }

  async showActionPlanConfirmation(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)

    if (actionPlan.submittedAt === null) {
      throw new Error('Trying to view confirmation page for action plan that hasn’t been submitted')
    }

    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
      sentReferral.referral.serviceCategoryId
    )

    const presenter = new ActionPlanConfirmationPresenter(sentReferral, serviceCategory)
    const view = new ActionPlanConfirmationView(presenter)

    res.render(...view.renderArgs)
  }

  async addNumberOfSessionsToActionPlan(req: Request, res: Response): Promise<void> {
    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null
    const { accessToken: token } = res.locals.user.token
    const actionPlanId = req.params.id

    if (req.method === 'POST') {
      userInputData = req.body

      const form = await ActionPlanNumberOfSessionsForm.createForm(req)
      formError = form.error

      if (form.isValid) {
        await this.interventionsService.updateDraftActionPlan(token, actionPlanId, form.paramsForUpdate)
        return res.redirect(`/service-provider/action-plan/${actionPlanId}/review`)
      }
    }

    const actionPlan = await this.interventionsService.getActionPlan(token, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(token, actionPlan.referralId)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const serviceCategory = await this.interventionsService.getServiceCategory(
      token,
      referral.referral.serviceCategoryId
    )

    const presenter = new AddActionPlanNumberOfSessionsPresenter(
      actionPlan,
      serviceUser,
      serviceCategory,
      formError,
      userInputData
    )
    const view = new AddActionPlanNumberOfSessionsView(presenter)
    res.status(formError === null ? 200 : 400)
    return res.render(...view.renderArgs)
  }

  async editSession(req: Request, res: Response): Promise<void> {
    const sessionNumber = Number(req.params.sessionNumber)

    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null

    if (req.method === 'POST') {
      const data = await new EditSessionForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        await this.interventionsService.updateActionPlanAppointment(
          res.locals.user.token.accessToken,
          req.params.id,
          sessionNumber,
          data.paramsForUpdate
        )

        const actionPlan = await this.interventionsService.getActionPlan(
          res.locals.user.token.accessToken,
          req.params.id
        )

        res.redirect(`/service-provider/referrals/${actionPlan.referralId}/progress`)
        return
      }
    }

    const appointment = await this.interventionsService.getActionPlanAppointment(
      res.locals.user.token.accessToken,
      req.params.id,
      sessionNumber
    )

    const presenter = new EditSessionPresenter(appointment, formError, userInputData)
    const view = new EditSessionView(presenter)
    res.render(...view.renderArgs)
  }

  async showPostSessionAttendanceFeedbackForm(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { actionPlanId, sessionNumber } = req.params

    const actionPlan = await this.interventionsService.getActionPlan(user.token, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(user.token, actionPlan.referralId)

    const appointment = await this.interventionsService.getActionPlanAppointment(
      user.token,
      actionPlanId,
      Number(sessionNumber)
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new PostSessionAttendanceFeedbackPresenter(appointment, serviceUser)
    const view = new PostSessionAttendanceFeedbackView(presenter)

    return res.render(...view.renderArgs)
  }

  async recordPostSessionAttendanceFeedback(req: Request, res: Response): Promise<void> {
    let formError: FormValidationError | null = null
    const { user } = res.locals
    const { actionPlanId, sessionNumber } = req.params

    const form = await PostSessionAttendanceFeedbackForm.createForm(req)
    formError = form.error

    if (form.isValid) {
      await this.interventionsService.recordAppointmentAttendance(
        res.locals.token,
        actionPlanId,
        Number(sessionNumber),
        form.attendanceParams
      )

      return res.redirect(
        `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/behaviour`
      )
    }

    const actionPlan = await this.interventionsService.getActionPlan(user.token, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(user.token, actionPlan.referralId)

    const appointment = await this.interventionsService.getActionPlanAppointment(
      user.token,
      actionPlanId,
      Number(sessionNumber)
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new PostSessionAttendanceFeedbackPresenter(appointment, serviceUser, formError, req.body)
    const view = new PostSessionAttendanceFeedbackView(presenter)

    return res.render(...view.renderArgs)
  }

  async addPostSessionBehaviourFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { actionPlanId, sessionNumber } = req.params

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    if (req.method === 'POST') {
      const data = await new PostSessionBehaviourFeedbackForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        await this.interventionsService.recordAppointmentBehaviour(
          res.locals.token,
          actionPlanId,
          Number(sessionNumber),
          data.paramsForUpdate
        )

        return res.redirect(
          `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/confirmation`
        )
      }
    }

    const actionPlan = await this.interventionsService.getActionPlan(user.token, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(user.token, actionPlan.referralId)

    const appointment = await this.interventionsService.getActionPlanAppointment(
      user.token,
      actionPlanId,
      Number(sessionNumber)
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser, formError, userInputData)
    const view = new PostSessionBehaviourFeedbackView(presenter)

    res.status(formError === null ? 200 : 400)
    return res.render(...view.renderArgs)
  }

  async showPostSessionFeedbackConfirmation(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { actionPlanId, sessionNumber } = req.params
    const actionPlan = await this.interventionsService.getActionPlan(user.token, actionPlanId)

    const currentAppointment = await this.interventionsService.getActionPlanAppointment(
      user.token,
      actionPlanId,
      Number(sessionNumber)
    )

    const nextAppointmentOrNull = await this.interventionsService.getSubsequentActionPlanAppointment(
      user.token,
      actionPlan,
      currentAppointment
    )

    const presenter = new PostSessionFeedbackConfirmationPresenter(
      actionPlan,
      currentAppointment,
      nextAppointmentOrNull
    )
    const view = new PostSessionFeedbackConfirmationView(presenter)

    res.render(...view.renderArgs)
  }
}
