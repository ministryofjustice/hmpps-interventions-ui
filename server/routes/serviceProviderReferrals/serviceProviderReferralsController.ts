import { Request, Response } from 'express'
import createError from 'http-errors'
import querystring from 'querystring'
import CommunityApiService from '../../services/communityApiService'
import InterventionsService from '../../services/interventionsService'
import { ActionPlanAppointment } from '../../models/actionPlan'
import HmppsAuthService from '../../services/hmppsAuthService'
import CheckAssignmentPresenter from './checkAssignmentPresenter'
import CheckAssignmentView from './checkAssignmentView'
import DashboardPresenter from './dashboardPresenter'
import DashboardView from './dashboardView'
import ShowReferralPresenter from '../shared/showReferralPresenter'
import ShowReferralView from '../shared/showReferralView'
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
import PostSessionFeedbackCheckAnswersView from './postSessionFeedbackCheckAnswersView'
import PostSessionFeedbackCheckAnswersPresenter from './postSessionFeedbackCheckAnswersPresenter'
import SubmittedPostSessionFeedbackView from '../shared/submittedPostSessionFeedbackView'
import SubmittedPostSessionFeedbackPresenter from '../shared/submittedPostSessionFeedbackPresenter'
import EndOfServiceReportOutcomeForm from './endOfServiceReportOutcomeForm'
import EndOfServiceReportOutcomePresenter from './endOfServiceReportOutcomePresenter'
import EndOfServiceReportOutcomeView from './endOfServiceReportOutcomeView'
import EndOfServiceReportFurtherInformationForm from './endOfServiceReportFurtherInformationForm'
import EndOfServiceReportFurtherInformationPresenter from './endOfServiceReportFurtherInformationPresenter'
import EndOfServiceReportFurtherInformationView from './endOfServiceReportFurtherInformationView'
import EndOfServiceReportCheckAnswersPresenter from './endOfServiceReportCheckAnswersPresenter'
import EndOfServiceReportCheckAnswersView from './endOfServiceReportCheckAnswersView'
import EndOfServiceReportConfirmationPresenter from './endOfServiceReportConfirmationPresenter'
import EndOfServiceReportConfirmationView from './endOfServiceReportConfirmationView'
import ControllerUtils from '../../utils/controllerUtils'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import ServiceCategory from '../../models/serviceCategory'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import ActionPlanPresenter from '../shared/actionPlanPresenter'
import ActionPlanView from '../shared/actionPlanView'

export default class ServiceProviderReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService
  ) {}

  async showDashboard(req: Request, res: Response): Promise<void> {
    const referrals = await this.interventionsService.getSentReferralsForUserToken(res.locals.user.token.accessToken)

    const dedupedInterventionIds = Array.from(new Set(referrals.map(referral => referral.referral.interventionId)))

    const interventions = await Promise.all(
      dedupedInterventionIds.map(id => this.interventionsService.getIntervention(res.locals.user.token.accessToken, id))
    )

    const presenter = new DashboardPresenter(referrals, interventions)
    const view = new DashboardView(presenter)

    ControllerUtils.renderWithLayout(res, view, null)
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
      this.assessRisksAndNeedsService.getSupplementaryRiskInformation(sentReferral.supplementaryRiskId),
      this.assessRisksAndNeedsService.getRiskSummary(crn, accessToken),
    ])

    const assignee =
      sentReferral.assignedTo === null
        ? null
        : await this.hmppsAuthService.getSPUserByUsername(accessToken, sentReferral.assignedTo.username)

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

    const presenter = new ShowReferralPresenter(
      sentReferral,
      intervention,
      conviction,
      riskInformation,
      sentBy,
      assignee,
      formError,
      'service-provider',
      true,
      expandedServiceUser,
      riskSummary
    )
    const view = new ShowReferralView(presenter)

    ControllerUtils.renderWithLayout(res, view, expandedServiceUser)
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

    const [intervention, actionPlan, serviceUser] = await Promise.all([
      interventionPromise,
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

    const presenter = new InterventionProgressPresenter(sentReferral, intervention, actionPlan, actionPlanAppointments)
    const view = new InterventionProgressView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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

    let assignee: AuthUserDetails
    const token = await this.hmppsAuthService.getApiClientToken()

    try {
      assignee = await this.hmppsAuthService.getSPUserByEmailAddress(token, email)
    } catch (e) {
      return res.redirect(
        `/service-provider/referrals/${req.params.id}/details?${querystring.stringify({
          error: errorMessages.assignReferral.emailNotFound,
        })}`
      )
    }

    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)
    const [intervention, serviceUser] = await Promise.all([
      this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.referral.interventionId),
      this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn),
    ])

    const presenter = new CheckAssignmentPresenter(referral.id, assignee, email, intervention)
    const view = new CheckAssignmentView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async assignReferral(req: Request, res: Response): Promise<void> {
    const { email } = req.body
    if (email === undefined || email === null || email === '') {
      res.sendStatus(400)
      return
    }

    const assignee = await this.hmppsAuthService.getSPUserByEmailAddress(res.locals.user.token.accessToken, email)

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

    const [assignee, intervention, serviceUser] = await Promise.all([
      this.hmppsAuthService.getSPUserByUsername(res.locals.user.token.accessToken, referral.assignedTo.username),
      this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.referral.interventionId),
      this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn),
    ])

    const presenter = new AssignmentConfirmationPresenter(referral, intervention, assignee)
    const view = new AssignmentConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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

    const [serviceCategories, serviceUser] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan)
    const view = new AddActionPlanActivitiesView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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

    const [serviceCategories, serviceUser] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, form.error)
    const view = new AddActionPlanActivitiesView(presenter)

    res.status(400)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async finaliseActionPlanActivities(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const serviceCategories = await Promise.all(
      sentReferral.referral.serviceCategoryIds.map(id =>
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
      )
    )

    const form = new FinaliseActionPlanActivitiesForm(actionPlan)

    if (form.isValid) {
      res.redirect(`/service-provider/action-plan/${actionPlan.id}/number-of-sessions`)
    } else {
      const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, form.error)
      const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
      const view = new AddActionPlanActivitiesView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async reviewActionPlan(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const sentReferral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )

    const [serviceCategories, serviceUser] = await Promise.all([
      Promise.all(
        sentReferral.referral.serviceCategoryIds.map(id =>
          this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, id)
        )
      ),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategories, actionPlan)
    const view = new ReviewActionPlanView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(
        res.locals.user.token.accessToken,
        sentReferral.referral.serviceCategoryIds[0]
      ),
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new ActionPlanConfirmationPresenter(sentReferral, serviceCategory)
    const view = new ActionPlanConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
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
      referral.referral.serviceCategoryIds[0]
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
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async editSession(req: Request, res: Response): Promise<void> {
    const sessionNumber = Number(req.params.sessionNumber)

    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null
    let serverError: FormValidationError | null = null

    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)

    if (req.method === 'POST') {
      const data = await new EditSessionForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        try {
          await this.interventionsService.updateActionPlanAppointment(
            res.locals.user.token.accessToken,
            req.params.id,
            sessionNumber,
            data.paramsForUpdate
          )
          return res.redirect(`/service-provider/referrals/${actionPlan.referralId}/progress`)
        } catch (e) {
          if (e.status === 409) {
            res.status(400)
            serverError = {
              errors: [
                {
                  formFields: ['session-input'],
                  errorSummaryLinkedField: 'session-input',
                  message:
                    'The proposed date and time you selected clashes with another appointment. Please select a different date and time.',
                },
              ],
            }
          } else {
            throw e
          }
        }
      }
    }

    const appointment = await this.interventionsService.getActionPlanAppointment(
      res.locals.user.token.accessToken,
      req.params.id,
      sessionNumber
    )
    const referral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EditSessionPresenter(appointment, formError, userInputData, serverError)
    const view = new EditSessionView(presenter)
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async addPostSessionAttendanceFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber } = req.params

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    const data = await new PostSessionAttendanceFeedbackForm(req).data()

    if (req.method === 'POST') {
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        const updatedAppointment = await this.interventionsService.recordAppointmentAttendance(
          accessToken,
          actionPlanId,
          Number(sessionNumber),
          data.paramsForUpdate
        )

        const redirectPath =
          updatedAppointment.sessionFeedback?.attendance?.attended === 'no' ? 'check-your-answers' : 'behaviour'

        return res.redirect(
          `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/${redirectPath}`
        )
      }
    }

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)

    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)

    const appointment = await this.interventionsService.getActionPlanAppointment(
      accessToken,
      actionPlanId,
      Number(sessionNumber)
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new PostSessionAttendanceFeedbackPresenter(appointment, serviceUser, formError, userInputData)
    const view = new PostSessionAttendanceFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async addPostSessionBehaviourFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
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
          accessToken,
          actionPlanId,
          Number(sessionNumber),
          data.paramsForUpdate
        )

        return res.redirect(
          `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/check-your-answers`
        )
      }
    }

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)

    const appointment = await this.interventionsService.getActionPlanAppointment(
      accessToken,
      actionPlanId,
      Number(sessionNumber)
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser, formError, userInputData)
    const view = new PostSessionBehaviourFeedbackView(presenter)

    res.status(formError === null ? 200 : 400)
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async checkPostSessionFeedbackAnswers(req: Request, res: Response): Promise<void> {
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

    const presenter = new PostSessionFeedbackCheckAnswersPresenter(currentAppointment, serviceUser, actionPlanId)
    const view = new PostSessionFeedbackCheckAnswersView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitPostSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber } = req.params

    await this.interventionsService.submitSessionFeedback(accessToken, actionPlanId, Number(sessionNumber))

    return res.redirect(
      `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/confirmation`
    )
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

    const presenter = new SubmittedPostSessionFeedbackPresenter(currentAppointment, serviceUser)
    const view = new SubmittedPostSessionFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async showPostSessionFeedbackConfirmation(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber } = req.params
    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)

    const currentAppointment = await this.interventionsService.getActionPlanAppointment(
      accessToken,
      actionPlanId,
      Number(sessionNumber)
    )

    const nextAppointmentOrNull = await this.interventionsService.getSubsequentActionPlanAppointment(
      accessToken,
      actionPlan,
      currentAppointment
    )

    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new PostSessionFeedbackConfirmationPresenter(
      actionPlan,
      currentAppointment,
      nextAppointmentOrNull
    )
    const view = new PostSessionFeedbackConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async createDraftEndOfServiceReport(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)

    let draftEndOfServiceReportId = referral.endOfServiceReport?.id

    if (!draftEndOfServiceReportId) {
      const draftEndOfServiceReport = await this.interventionsService.createDraftEndOfServiceReport(
        accessToken,
        referralId
      )

      draftEndOfServiceReportId = draftEndOfServiceReport.id
    }

    res.redirect(303, `/service-provider/end-of-service-report/${draftEndOfServiceReportId}/outcomes/1`)
  }

  async editEndOfServiceReportOutcome(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)

    const desiredOutcomeNumber = Number(req.params.number)
    const desiredOutcomeIds = referral.referral.desiredOutcomes.flatMap(
      desiredOutcome => desiredOutcome.desiredOutcomesIds
    )
    if (desiredOutcomeNumber > desiredOutcomeIds.length) {
      throw createError(400, 'Outcome number is out of bounds')
    }

    const desiredOutcomeId = desiredOutcomeIds[desiredOutcomeNumber - 1]

    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
      referral.referral.serviceCategoryIds
    )

    const matchedServiceCategory = serviceCategories.find(serviceCategory =>
      serviceCategory.desiredOutcomes.some(desiredOutcome => desiredOutcome.id === desiredOutcomeId)
    )
    if (matchedServiceCategory === undefined) {
      throw new Error(`Desired outcome for ID ${desiredOutcomeId} not found`)
    }
    const matchedDesiredOutcome = matchedServiceCategory.desiredOutcomes.find(val => val.id === desiredOutcomeId)

    if (matchedDesiredOutcome === undefined) {
      throw new Error(`Desired outcome for ID ${desiredOutcomeId} not found`)
    }

    const outcome = endOfServiceReport.outcomes.find(val => val.desiredOutcome.id === desiredOutcomeId) ?? null

    let formValidationError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    if (req.method === 'POST') {
      userInputData = req.body
      const form = new EndOfServiceReportOutcomeForm(req, desiredOutcomeId, referral.referral.serviceUser)
      const formData = await form.data()

      if (formData.error) {
        formValidationError = formData.error
        res.status(400)
      } else {
        await this.interventionsService.updateDraftEndOfServiceReport(
          accessToken,
          endOfServiceReport.id,
          formData.paramsForUpdate
        )

        const isLastDesiredOutcome = desiredOutcomeNumber === desiredOutcomeIds.length
        if (isLastDesiredOutcome) {
          res.redirect(`/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)
        } else {
          res.redirect(
            `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/${desiredOutcomeNumber + 1}`
          )
        }
        return
      }
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportOutcomePresenter(
      referral,
      endOfServiceReport,
      matchedServiceCategory,
      matchedDesiredOutcome,
      desiredOutcomeNumber,
      outcome,
      userInputData,
      formValidationError
    )
    const view = new EndOfServiceReportOutcomeView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async editEndOfServiceReportFurtherInformation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id } = req.params

    if (req.method === 'POST') {
      const form = new EndOfServiceReportFurtherInformationForm(req)
      await this.interventionsService.updateDraftEndOfServiceReport(accessToken, id, form.paramsForUpdate)
      res.redirect(`/service-provider/end-of-service-report/${id}/check-answers`)
      return
    }

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportFurtherInformationPresenter(
      endOfServiceReport,
      serviceCategories[0],
      referral,
      null
    )
    const view = new EndOfServiceReportFurtherInformationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async endOfServiceReportCheckAnswers(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportCheckAnswersPresenter(referral, endOfServiceReport, serviceCategories[0])
    const view = new EndOfServiceReportCheckAnswersView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitEndOfServiceReport(req: Request, res: Response): Promise<void> {
    await this.interventionsService.submitEndOfServiceReport(res.locals.user.token.accessToken, req.params.id)
    res.redirect(`/service-provider/end-of-service-report/${req.params.id}/confirmation`)
  }

  async showEndOfServiceReportConfirmation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    const endOfServiceReport = await this.interventionsService.getEndOfServiceReport(accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, endOfServiceReport.referralId)
    const serviceCategories = await this.findSelectedServiceCategories(
      accessToken,
      referral.referral.interventionId,
      referral.referral.serviceCategoryIds
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new EndOfServiceReportConfirmationPresenter(referral, serviceCategories[0])
    const view = new EndOfServiceReportConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewActionPlan(req: Request, res: Response): Promise<void> {
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

    const presenter = new ActionPlanPresenter(sentReferral, actionPlan, 'service-provider')
    const view = new ActionPlanView(presenter, false)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  private async findSelectedServiceCategories(
    accessToken: string,
    interventionId: string,
    selectedServiceCategoryIds: string[]
  ): Promise<ServiceCategory[]> {
    const intervention = await this.interventionsService.getIntervention(accessToken, interventionId)
    const serviceCategories = intervention.serviceCategories.filter(serviceCategory =>
      selectedServiceCategoryIds.some(serviceCategoryId => serviceCategoryId === serviceCategory.id)
    )
    if (serviceCategories.length !== selectedServiceCategoryIds.length) {
      throw new Error('Expected service categories are missing in intervention')
    }
    return serviceCategories
  }
}
