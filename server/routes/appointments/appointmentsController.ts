import { Request, Response } from 'express'
import createError from 'http-errors'
import SupplierAssessmentDecorator from '../../decorators/supplierAssessmentDecorator'
import {
  ActionPlanAppointment,
  AppointmentSchedulingDetails,
  InitialAssessmentAppointment,
} from '../../models/appointment'
import DeliusOfficeLocation from '../../models/deliusOfficeLocation'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import CommunityApiService from '../../services/communityApiService'
import DeliusOfficeLocationFilter from '../../services/deliusOfficeLocationFilter'
import DraftsService from '../../services/draftsService'
import HmppsAuthService from '../../services/hmppsAuthService'
import InterventionsService, { InterventionsServiceError } from '../../services/interventionsService'
import ReferenceDataService from '../../services/referenceDataService'
import ControllerUtils from '../../utils/controllerUtils'
import { FormValidationError } from '../../utils/formValidationError'
import ScheduleActionPlanSessionPresenter from '../service-provider/action-plan/sessions/edit/scheduleActionPlanSessionPresenter'
import ActionPlanSessionCheckAnswersPresenter from '../serviceProviderReferrals/actionPlanSessionCheckAnswersPresenter'
import InitialAssessmentCheckAnswersPresenter from '../serviceProviderReferrals/initialAssessmentCheckAnswersPresenter'
import ScheduleAppointmentCheckAnswersView from '../serviceProviderReferrals/scheduleAppointmentCheckAnswersView'
import ScheduleAppointmentForm from '../serviceProviderReferrals/scheduleAppointmentForm'
import ScheduleAppointmentPresenter from '../serviceProviderReferrals/scheduleAppointmentPresenter'
import ScheduleAppointmentView from '../serviceProviderReferrals/scheduleAppointmentView'
import SupplierAssessmentAppointmentConfirmationPresenter from '../serviceProviderReferrals/supplierAssessmentAppointmentConfirmationPresenter'
import SupplierAssessmentAppointmentConfirmationView from '../serviceProviderReferrals/supplierAssessmentAppointmentConfirmationView'
import SubmittedFeedbackPresenter from '../shared/appointment/feedback/submittedFeedbackPresenter'
import SubmittedFeedbackView from '../shared/appointment/feedback/submittedFeedbackView'
import SupplierAssessmentAppointmentPresenter from '../shared/supplierAssessmentAppointmentPresenter'
import SupplierAssessmentAppointmentView from '../shared/supplierAssessmentAppointmentView'
import AppointmentSummary from './appointmentSummary'
import ActionPlanPostSessionAttendanceFeedbackPresenter from './feedback/actionPlanSessions/attendance/actionPlanPostSessionAttendanceFeedbackPresenter'
import ActionPlanSessionBehaviourFeedbackPresenter from './feedback/actionPlanSessions/behaviour/actionPlanSessionBehaviourFeedbackPresenter'
import ActionPlanPostSessionFeedbackCheckAnswersPresenter from './feedback/actionPlanSessions/checkYourAnswers/actionPlanPostSessionFeedbackCheckAnswersPresenter'
import PostSessionFeedbackConfirmationPresenter from './feedback/actionPlanSessions/confirmation/postSessionFeedbackConfirmationPresenter'
import PostSessionFeedbackConfirmationView from './feedback/actionPlanSessions/confirmation/postSessionFeedbackConfirmationView'
import InitialAssessmentAttendanceFeedbackPresenter from './feedback/initialAssessment/attendance/initialAssessmentAttendanceFeedbackPresenter'
import InitialAssessmentBehaviourFeedbackPresenter from './feedback/initialAssessment/behaviour/initialAssessmentBehaviourFeedbackPresenter'
import InitialAssessmentFeedbackCheckAnswersPresenter from './feedback/initialAssessment/checkYourAnswers/initialAssessmentFeedbackCheckAnswersPresenter'
import InitialAssessmentFeedbackConfirmationPresenter from './feedback/initialAssessment/confirmation/initialAssessmentFeedbackConfirmationPresenter'
import InitialAssessmentFeedbackConfirmationView from './feedback/initialAssessment/confirmation/initialAssessmentFeedbackConfirmationView'
import AttendanceFeedbackForm from './feedback/shared/attendance/attendanceFeedbackForm'
import AttendanceFeedbackView from './feedback/shared/attendance/attendanceFeedbackView'
import BehaviourFeedbackForm from './feedback/shared/behaviour/behaviourFeedbackForm'
import BehaviourFeedbackView from './feedback/shared/behaviour/behaviourFeedbackView'
import CheckFeedbackAnswersView from './feedback/shared/checkYourAnswers/checkFeedbackAnswersView'
import logger from '../../../log'
import SentReferral from '../../models/sentReferral'

export type DraftAppointmentBooking = null | AppointmentSchedulingDetails

export default class AppointmentsController {
  private readonly deliusOfficeLocationFilter: DeliusOfficeLocationFilter

  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly draftsService: DraftsService,
    private readonly referenceDataService: ReferenceDataService
  ) {
    this.deliusOfficeLocationFilter = new DeliusOfficeLocationFilter(referenceDataService)
  }

  async startSupplierAssessmentAppointmentScheduling(req: Request, res: Response): Promise<void> {
    const draftBooking = await this.draftsService.createDraft('supplierAssessmentBooking', null, {
      userId: res.locals.user.userId,
    })

    res.redirect(`/service-provider/referrals/${req.params.id}/supplier-assessment/schedule/${draftBooking.id}/details`)
  }

  async scheduleSupplierAssessmentAppointment(req: Request, res: Response): Promise<void> {
    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult

    const referralId = req.params.id
    const { accessToken } = res.locals.user.token
    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const supplierAssessment = await this.interventionsService.getSupplierAssessment(accessToken, referralId)
    const intervention = await this.interventionsService.getIntervention(accessToken, referral.referral.interventionId)
    const deliusOfficeLocations: DeliusOfficeLocation[] =
      await this.deliusOfficeLocationFilter.findOfficesByIntervention(intervention)
    const { currentAppointment } = new SupplierAssessmentDecorator(supplierAssessment)
    const hasExistingScheduledAppointment = currentAppointment !== null && !currentAppointment.sessionFeedback.submitted

    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null
    let serverError: FormValidationError | null = null

    if (req.method === 'POST') {
      const data = await new ScheduleAppointmentForm(req, deliusOfficeLocations).data()
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        await this.draftsService.updateDraft(draft.id, data.paramsForUpdate, { userId: res.locals.user.userId })
        res.redirect(`/service-provider/referrals/${referralId}/supplier-assessment/schedule/${draft.id}/check-answers`)
        return
      }
    } else if (req.query.clash === 'true') {
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
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    let appointmentSummary: AppointmentSummary | null = null
    if (currentAppointment) {
      appointmentSummary = await this.createAppointmentSummary(accessToken, currentAppointment, referral)
    }
    const overrideBackLinkHref = hasExistingScheduledAppointment
      ? `/service-provider/referrals/${referralId}/supplier-assessment`
      : undefined

    const presenter = new ScheduleAppointmentPresenter(
      'supplierAssessment',
      referral,
      currentAppointment,
      appointmentSummary,
      deliusOfficeLocations,
      formError,
      draft.data,
      userInputData,
      serverError,
      overrideBackLinkHref
    )

    const view = new ScheduleAppointmentView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async checkSupplierAssessmentAnswers(req: Request, res: Response): Promise<void> {
    const referralId = req.params.id

    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, referralId)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }

    const presenter = new InitialAssessmentCheckAnswersPresenter(fetchResult.draft, referral.id)
    const view = new ScheduleAppointmentCheckAnswersView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitSupplierAssessmentAppointment(req: Request, res: Response): Promise<void> {
    const referralId = req.params.id
    const { draftBookingId } = req.params
    const { accessToken } = res.locals.user.token
    const supplierAssessment = await this.interventionsService.getSupplierAssessment(accessToken, referralId)

    const { currentAppointment } = new SupplierAssessmentDecorator(supplierAssessment)
    const hasExistingScheduledAppointment = currentAppointment !== null && !currentAppointment.sessionFeedback.submitted

    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult

    if (draft.data === null) {
      throw new Error('Draft data was unexpectedly null when submitting appointment')
    }

    try {
      await this.interventionsService.scheduleSupplierAssessmentAppointment(
        res.locals.user.token.accessToken,
        supplierAssessment.id,
        draft.data
      )
    } catch (e) {
      const interventionsServiceError = e as InterventionsServiceError
      if (interventionsServiceError.status === 409) {
        res.redirect(
          `/service-provider/referrals/${req.params.id}/supplier-assessment/schedule/${draftBookingId}/details?clash=true`
        )
        return
      }

      throw e
    }

    await this.draftsService.deleteDraft(draft.id, { userId: res.locals.user.userId })

    const successfulRedirectPath = hasExistingScheduledAppointment
      ? 'rescheduled-confirmation'
      : 'scheduled-confirmation'

    res.redirect(`/service-provider/referrals/${referralId}/supplier-assessment/${successfulRedirectPath}`)
  }

  async showSupplierAssessmentAppointmentConfirmation(
    req: Request,
    res: Response,
    { isReschedule }: { isReschedule: boolean }
  ): Promise<void> {
    const referralId = req.params.id

    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, referralId)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new SupplierAssessmentAppointmentConfirmationPresenter(referral, isReschedule)
    const view = new SupplierAssessmentAppointmentConfirmationView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async showSupplierAssessmentAppointment(
    req: Request,
    res: Response,
    userType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const referralId = req.params.id
    const { accessToken } = res.locals.user.token
    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(res.locals.user.token.accessToken, referralId),

      this.interventionsService.getSupplierAssessment(res.locals.user.token.accessToken, referralId),
    ])

    const appointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
    if (appointment === null) {
      throw new Error('Attempting to view supplier assessment without a current appointment')
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment, appointmentSummary, {
      readonly: userType === 'probation-practitioner',
      userType,
    })
    const view = new SupplierAssessmentAppointmentView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async startEditingActionPlanSessionAppointment(req: Request, res: Response): Promise<void> {
    const draft = await this.draftsService.createDraft('actionPlanSessionUpdate', null, {
      userId: res.locals.user.userId,
    })

    res.redirect(
      `/service-provider/action-plan/${req.params.id}/sessions/${req.params.sessionNumber}/edit/${draft.id}/details`
    )
  }

  async editActionPlanSessionAppointment(req: Request, res: Response): Promise<void> {
    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult
    const { accessToken } = res.locals.user.token
    const sessionNumber = Number(req.params.sessionNumber)

    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)
    const intervention = await this.interventionsService.getIntervention(accessToken, referral.referral.interventionId)
    const deliusOfficeLocations: DeliusOfficeLocation[] =
      await this.deliusOfficeLocationFilter.findOfficesByIntervention(intervention)

    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null
    let serverError: FormValidationError | null = null

    if (req.method === 'POST') {
      const data = await new ScheduleAppointmentForm(req, deliusOfficeLocations).data()

      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        await this.draftsService.updateDraft(draft.id, data.paramsForUpdate, { userId: res.locals.user.userId })
        res.redirect(
          `/service-provider/action-plan/${actionPlan.id}/sessions/${sessionNumber}/edit/${draft.id}/check-answers`
        )
        return
      }
    } else if (req.query.clash === 'true') {
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
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const appointment = await this.interventionsService.getActionPlanAppointment(
      res.locals.user.token.accessToken,
      req.params.id,
      sessionNumber
    )
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new ScheduleActionPlanSessionPresenter(
      referral,
      appointment,
      appointmentSummary,
      deliusOfficeLocations,
      formError,
      draft.data,
      userInputData,
      serverError
    )
    const view = new ScheduleAppointmentView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async checkActionPlanSessionAppointmentAnswers(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const sessionNumber = Number(req.params.sessionNumber)

    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }

    const presenter = new ActionPlanSessionCheckAnswersPresenter(fetchResult.draft, actionPlan.id, sessionNumber)
    const view = new ScheduleAppointmentCheckAnswersView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitActionPlanSessionAppointment(req: Request, res: Response): Promise<void> {
    const sessionNumber = Number(req.params.sessionNumber)

    const { draftBookingId } = req.params
    const { accessToken } = res.locals.user.token
    const actionPlanId = req.params.id
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, actionPlanId)

    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult

    if (draft.data === null) {
      throw new Error('Draft data was unexpectedly null when submitting appointment')
    }

    try {
      await this.interventionsService.updateActionPlanAppointment(accessToken, actionPlanId, sessionNumber, draft.data)
    } catch (e) {
      const interventionsServiceError = e as InterventionsServiceError
      if (interventionsServiceError.status === 409) {
        res.redirect(
          `/service-provider/action-plan/${actionPlanId}/sessions/${sessionNumber}/edit/${draftBookingId}/details?clash=true`
        )
        return
      }

      throw e
    }

    await this.draftsService.deleteDraft(draft.id, { userId: res.locals.user.userId })
    res.redirect(`/service-provider/referrals/${actionPlan.referralId}/progress`)
  }

  private async fetchDraftBookingOrRenderMessage(req: Request, res: Response) {
    return ControllerUtils.fetchDraftOrRenderMessage<DraftAppointmentBooking>(req, res, this.draftsService, {
      idParamName: 'draftBookingId',
      notFoundUserMessage:
        'Too much time has passed since you started booking this appointment. Your answers have not been saved, and you will need to start again.',
      typeName: 'booking',
    })
  }

  async addSupplierAssessmentAttendanceFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])
    const appointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
    if (appointment === null) {
      throw new Error('Attempting to add supplier assessment attendance feedback without a current appointment')
    }
    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    const data = await new AttendanceFeedbackForm(req).data()

    if (req.method === 'POST') {
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        const updatedAppointment = await this.interventionsService.recordSupplierAssessmentAppointmentAttendance(
          accessToken,
          referralId,
          data.paramsForUpdate
        )
        const redirectPath =
          updatedAppointment.sessionFeedback?.attendance?.attended === 'no' ? 'check-your-answers' : 'behaviour'
        return res.redirect(
          `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/${redirectPath}`
        )
      }
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new InitialAssessmentAttendanceFeedbackPresenter(
      appointment,
      serviceUser,
      appointmentSummary,
      referralId,
      formError,
      userInputData
    )
    const view = new AttendanceFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async addSupplierAssessmentBehaviourFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])
    const appointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
    if (appointment === null) {
      throw new Error('Attempting to add initial assessment behaviour feedback without a current appointment')
    }
    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null
    if (req.method === 'POST') {
      const data = await new BehaviourFeedbackForm(req).data()
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        await this.interventionsService.recordSupplierAssessmentAppointmentBehaviour(
          accessToken,
          referralId,
          data.paramsForUpdate
        )
        return res.redirect(
          `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/check-your-answers`
        )
      }
    }
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const presenter = new InitialAssessmentBehaviourFeedbackPresenter(
      appointment,
      serviceUser,
      referralId,
      formError,
      userInputData
    )
    const view = new BehaviourFeedbackView(presenter)
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async checkSupplierAssessmentFeedbackAnswers(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])
    const appointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
    if (appointment === null) {
      throw new Error('Attempting to check supplier assessment feedback answers without a current appointment')
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new InitialAssessmentFeedbackCheckAnswersPresenter(
      appointment,
      serviceUser,
      referralId,
      appointmentSummary
    )
    const view = new CheckFeedbackAnswersView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitSupplierAssessmentFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id
    const supplierAssessment = await this.interventionsService.getSupplierAssessment(accessToken, referralId)
    const appointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
    if (appointment === null) {
      throw new Error('Attempting to submit supplier assessment feedback without a current appointment')
    }

    await this.interventionsService.submitSupplierAssessmentAppointmentFeedback(accessToken, referralId)

    return res.redirect(
      `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/confirmation`
    )
  }

  async showSupplierAssessmentFeedbackConfirmation(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new InitialAssessmentFeedbackConfirmationPresenter(referralId)
    const view = new InitialAssessmentFeedbackConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewSupplierAssessmentFeedback(
    req: Request,
    res: Response,
    userType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { referralId, appointmentId } = req.params

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])

    if (!referral.assignedTo) {
      throw new Error('Referral has not yet been assigned to a caseworker')
    }

    let supplierAssessmentAppointment: InitialAssessmentAppointment | null

    if (appointmentId) {
      supplierAssessmentAppointment =
        supplierAssessment.appointments.find(appointment => appointment.id === appointmentId) || null

      if (!supplierAssessmentAppointment) {
        throw new Error('Could not find the requested appointment')
      }
    } else {
      supplierAssessmentAppointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment

      if (supplierAssessmentAppointment === null) {
        throw new Error('Attempting to view supplier assessment feedback without a current appointment')
      }
    }
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, supplierAssessmentAppointment, referral)
    const presenter = new SubmittedFeedbackPresenter(
      supplierAssessmentAppointment,
      appointmentSummary,
      serviceUser,
      userType,
      referralId
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async addPostSessionAttendanceFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber } = req.params

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    const data = await new AttendanceFeedbackForm(req).data()

    if (req.method === 'POST') {
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        const updatedAppointment = await this.interventionsService.recordActionPlanAppointmentAttendance(
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
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
      appointment,
      serviceUser,
      appointmentSummary,
      referral.id,
      formError,
      userInputData
    )
    const view = new AttendanceFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async addPostSessionBehaviourFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber } = req.params

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    if (req.method === 'POST') {
      const data = await new BehaviourFeedbackForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        await this.interventionsService.recordActionPlanAppointmentBehavior(
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

    const presenter = new ActionPlanSessionBehaviourFeedbackPresenter(
      appointment,
      serviceUser,
      actionPlanId,
      formError,
      userInputData
    )
    const view = new BehaviourFeedbackView(presenter)

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
    const appointmentSummary = await this.createAppointmentSummary(accessToken, currentAppointment, referral)
    const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
      currentAppointment,
      serviceUser,
      actionPlanId,
      appointmentSummary
    )
    const view = new CheckFeedbackAnswersView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitPostSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber } = req.params

    await this.interventionsService.submitActionPlanSessionFeedback(accessToken, actionPlanId, Number(sessionNumber))

    return res.redirect(
      `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/confirmation`
    )
  }

  private async getCaseWorker(accessToken: string, username: string): Promise<AuthUserDetails | string> {
    try {
      return this.hmppsAuthService.getSPUserByUsername(accessToken, username)
    } catch (e) {
      const interventionsServiceError = e as InterventionsServiceError
      if (interventionsServiceError.status === 404) {
        logger.warn(`Auth user details not found for user ${username}".`)
        return username
      }
      throw e
    }
  }

  private async getAssignedCaseworker(
    accessToken: string,
    referral: SentReferral
  ): Promise<AuthUserDetails | string | null> {
    const assignedToUsername = referral.assignedTo?.username
    return assignedToUsername ? this.getCaseWorker(accessToken, assignedToUsername) : null
  }

  private async getFeedbackSubmittedByCaseworker(
    accessToken: string,
    appointment: ActionPlanAppointment | InitialAssessmentAppointment
  ): Promise<AuthUserDetails | string | null> {
    const submittedByUsername = appointment?.sessionFeedback.submittedBy?.username
    return submittedByUsername ? this.getCaseWorker(accessToken, submittedByUsername) : null
  }

  private async createAppointmentSummary(
    accessToken: string,
    appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    referral: SentReferral
  ): Promise<AppointmentSummary> {
    const [deliusOfficeLocation, assignedCaseworker, feedbackSubmittedByCaseworker] = await Promise.all([
      this.deliusOfficeLocationFilter.findOfficeByAppointment(appointment),
      this.getAssignedCaseworker(accessToken, referral),
      this.getFeedbackSubmittedByCaseworker(accessToken, appointment),
    ])
    return new AppointmentSummary(appointment, assignedCaseworker, deliusOfficeLocation, feedbackSubmittedByCaseworker)
  }

  async viewSubmittedPostSessionFeedback(
    req: Request,
    res: Response,
    userType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { sessionNumber, actionPlanId } = req.params
    let { referralId } = req.params

    // SP journey doesn't pass a referralId
    if (!referralId) {
      const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)

      referralId = actionPlan.referralId
    }

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (referral.actionPlanId === null) {
      throw createError(500, `action plan does not exist on this referral '${referralId}'`, {
        userMessage: 'No action plan exists for this referral',
      })
    }

    const currentAppointment = await this.interventionsService.getActionPlanAppointment(
      accessToken,
      referral.actionPlanId,
      Number(sessionNumber)
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new SubmittedFeedbackPresenter(
      currentAppointment,
      await this.createAppointmentSummary(accessToken, currentAppointment, referral),
      serviceUser,
      userType,
      referral.id
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  // This is left to keep links in old emails still working - we'll monitor the endpoint and remove it when usage drops off.
  async viewLegacySubmittedPostSessionFeedbackAsProbationPractitioner(req: Request, res: Response): Promise<void> {
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

    if (!referral.assignedTo) {
      throw new Error('Referral has not yet been assigned to a caseworker')
    }

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, currentAppointment, referral)
    const presenter = new SubmittedFeedbackPresenter(
      currentAppointment,
      appointmentSummary,
      serviceUser,
      'probation-practitioner',
      referral.id,
      null
    )
    const view = new SubmittedFeedbackView(presenter)

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
}
