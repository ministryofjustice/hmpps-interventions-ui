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
import DeliusOfficeLocationFilter from '../../services/deliusOfficeLocationFilter'
import DraftsService, { Draft } from '../../services/draftsService'
import HmppsAuthService from '../../services/hmppsAuthService'
import InterventionsService, {
  CreateAppointmentSchedulingAndFeedback,
  InterventionsServiceError,
} from '../../services/interventionsService'
import ReferenceDataService from '../../services/referenceDataService'
import ControllerUtils, { DraftFetchSuccessResult } from '../../utils/controllerUtils'
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
import ActionPlanSessionFeedbackPresenter from './feedback/actionPlanSessions/sessionFeedback/actionPlanSessionFeedbackPresenter'
import ActionPlanPostSessionFeedbackCheckAnswersPresenter from './feedback/actionPlanSessions/checkYourAnswers/actionPlanPostSessionFeedbackCheckAnswersPresenter'
import InitialAssessmentAttendanceFeedbackPresenter from './feedback/initialAssessment/attendance/initialAssessmentAttendanceFeedbackPresenter'
import InitialAssessmentSessionFeedbackPresenter from './feedback/initialAssessment/sessionFeedback/initialAssessmentSessionFeedbackPresenter'
import InitialAssessmentFeedbackCheckAnswersPresenter from './feedback/initialAssessment/checkYourAnswers/initialAssessmentFeedbackCheckAnswersPresenter'
import AttendanceFeedbackForm from './feedback/shared/attendance/attendanceFeedbackForm'
import AttendanceFeedbackView from './feedback/shared/attendance/attendanceFeedbackView'
import SessionFeedbackForm from './feedback/shared/sessionFeedback/sessionFeedbackForm'
import SessionFeedbackView from './feedback/shared/sessionFeedback/sessionFeedbackView'
import CheckFeedbackAnswersView from './feedback/shared/checkYourAnswers/checkFeedbackAnswersView'
import logger from '../../../log'
import SentReferral from '../../models/sentReferral'
import { DraftAppointment, DraftAppointmentBooking } from '../serviceProviderReferrals/draftAppointment'
import SupplierAssessment from '../../models/supplierAssessment'
import { FormData } from '../../utils/forms/formData'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import AppointmentAttendanceFormDetails from '../../models/AppointmentAttendanceFormDetails'
import NoSessionFeedbackView from './feedback/shared/sessionFeedback/noSessionFeedbackView'
import ActionPlanNoSessionFeedbackPresenter from './feedback/actionPlanSessions/sessionFeedback/actionPlanNoSessionFeedbackPresenter'
import NoSessionYesAttendedFeedbackForm from './feedback/shared/sessionFeedback/forms/noSessionYesAttendedFeedbackForm'
import { Attended } from '../../models/appointmentAttendance'
import AppointmentSession from '../../models/sessionFeedback'
import NoSessionNoAttendedFeedbackForm from './feedback/shared/sessionFeedback/forms/noSessionNoAttendedFeedbackForm'
import InitialAssessmentNoSessionFeedbackPresenter from './feedback/initialAssessment/initialAssessmentNoSessionFeedbackPresenter'

export default class AppointmentsController {
  private readonly deliusOfficeLocationFilter: DeliusOfficeLocationFilter

  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly ramDeliusApiService: RamDeliusApiService,
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
    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res, 'service-provider')
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
    const hasExistingScheduledAppointment =
      currentAppointment !== null && !currentAppointment.appointmentFeedback.submitted

    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null
    let serverError: FormValidationError | null = null

    if (req.method === 'POST') {
      const data = await new ScheduleAppointmentForm(req, deliusOfficeLocations, false, referral.sentAt).data()
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

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
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
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async checkSupplierAssessmentAnswers(req: Request, res: Response): Promise<void> {
    const referralId = req.params.id

    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res, 'service-provider')
    if (fetchResult.rendered) {
      return
    }

    const presenter = new InitialAssessmentCheckAnswersPresenter(fetchResult.draft, referral.id)
    const view = new ScheduleAppointmentCheckAnswersView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async submitSupplierAssessmentAppointment(req: Request, res: Response): Promise<void> {
    const referralId = req.params.id
    const { draftBookingId } = req.params
    const { accessToken } = res.locals.user.token
    const supplierAssessment = await this.interventionsService.getSupplierAssessment(accessToken, referralId)

    const { currentAppointment } = new SupplierAssessmentDecorator(supplierAssessment)
    const hasExistingScheduledAppointment =
      currentAppointment !== null && !currentAppointment.appointmentFeedback.submitted

    const fetchResult = await this.fetchDraftBookingOrRenderMessage(req, res, 'service-provider')
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult

    if (draft.data === null) {
      throw new Error('Draft data was unexpectedly null when submitting appointment')
    }
    const appointmentScheduleDetails = this.extractAppointmentSchedulingDetails(fetchResult.draft)
    if (appointmentScheduleDetails === null || !appointmentScheduleDetails.appointmentTime) {
      throw new Error('No scheduling details were filled in on the draft')
    }
    if (this.isAPastAppointment(appointmentScheduleDetails)) {
      res.redirect(
        `/service-provider/referrals/${req.params.id}/supplier-assessment/post-assessment-feedback/edit/${draft.id}/attendance`
      )
      return
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
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const presenter = new SupplierAssessmentAppointmentConfirmationPresenter(referral, isReschedule)
    const view = new SupplierAssessmentAppointmentConfirmationView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
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

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment, appointmentSummary, {
      readonly: userType === 'probation-practitioner',
      userType,
    })
    const view = new SupplierAssessmentAppointmentView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, userType)
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
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(
      req,
      res,
      'service-provider',
      actionPlan.referralId
    )
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult
    const { accessToken } = res.locals.user.token
    const sessionNumber = Number(req.params.sessionNumber)

    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)
    const intervention = await this.interventionsService.getIntervention(accessToken, referral.referral.interventionId)
    const deliusOfficeLocations: DeliusOfficeLocation[] =
      await this.deliusOfficeLocationFilter.findOfficesByIntervention(intervention)

    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null
    let serverError: FormValidationError | null = null

    if (req.method === 'POST') {
      const data = await new ScheduleAppointmentForm(req, deliusOfficeLocations, true, referral.sentAt).data()

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

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointment = await this.interventionsService.getActionPlanAppointment(
      res.locals.user.token.accessToken,
      req.params.id,
      sessionNumber
    )
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const appointmentScheduleDetails = this.extractAppointmentSchedulingDetails(draft)
    const presenter = new ScheduleActionPlanSessionPresenter(
      referral,
      appointment,
      appointmentSummary,
      deliusOfficeLocations,
      formError,
      appointmentScheduleDetails,
      userInputData,
      serverError
    )
    const view = new ScheduleAppointmentView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async checkActionPlanSessionAppointmentAnswers(req: Request, res: Response): Promise<void> {
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, req.params.id)
    const referral = await this.interventionsService.getSentReferral(
      res.locals.user.token.accessToken,
      actionPlan.referralId
    )
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const sessionNumber = Number(req.params.sessionNumber)

    const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(
      req,
      res,
      'service-provider',
      actionPlan.referralId
    )
    if (fetchResult.rendered) {
      return
    }
    const appointmentScheduleDetails = this.extractAppointmentSchedulingDetails(fetchResult.draft)
    const presenter = new ActionPlanSessionCheckAnswersPresenter(
      appointmentScheduleDetails,
      actionPlan.id,
      sessionNumber,
      fetchResult.draft.id
    )
    const view = new ScheduleAppointmentCheckAnswersView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async submitActionPlanSessionAppointment(req: Request, res: Response): Promise<void> {
    const sessionNumber = Number(req.params.sessionNumber)

    const { draftBookingId } = req.params
    const { accessToken } = res.locals.user.token
    const actionPlanId = req.params.id
    const actionPlan = await this.interventionsService.getActionPlan(res.locals.user.token.accessToken, actionPlanId)

    const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(
      req,
      res,
      'service-provider',
      actionPlan.referralId
    )
    if (fetchResult.rendered) {
      return
    }
    const { draft } = fetchResult

    if (draft.data === null) {
      throw new Error('Draft data was unexpectedly null when submitting appointment')
    }
    const appointmentScheduleDetails = this.extractAppointmentSchedulingDetails(fetchResult.draft)
    if (appointmentScheduleDetails === null || !appointmentScheduleDetails.appointmentTime) {
      throw new Error('No scheduling details were filled in on the draft')
    }

    if (this.isAPastAppointment(appointmentScheduleDetails)) {
      res.redirect(
        `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/edit/${draft.id}/attendance`
      )
      return
    }

    const success = await this.updateSessionAppointmentAndCheckForConflicts(
      accessToken,
      actionPlanId,
      sessionNumber,
      appointmentScheduleDetails
    )

    if (!success) {
      res.redirect(
        `/service-provider/action-plan/${actionPlanId}/sessions/${sessionNumber}/edit/${draftBookingId}/details?clash=true`
      )
      return
    }

    await this.draftsService.deleteDraft(draft.id, { userId: res.locals.user.userId })
    res.redirect(`/service-provider/referrals/${actionPlan.referralId}/progress`)
  }

  // returns true on success, false on conflict
  private async updateSessionAppointmentAndCheckForConflicts(
    accessToken: string,
    actionPlanId: string,
    sessionNumber: number,
    data: AppointmentSchedulingDetails
  ): Promise<boolean> {
    try {
      await this.interventionsService.updateActionPlanAppointment(accessToken, actionPlanId, sessionNumber, data)
    } catch (e) {
      const interventionsServiceError = e as InterventionsServiceError
      if (interventionsServiceError.status === 409) {
        return false
      }
      throw e
    }
    return true
  }

  async addSupplierAssessmentAttendanceFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id
    const { draftBookingId } = req.params

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])
    const appointment = await this.getSupplierAssessmentAppointmentFromDraftOrService(
      req,
      res,
      supplierAssessment,
      referralId
    )

    if (appointment === null) {
      if (draftBookingId) {
        logger.warn(`Attempting to add supplier assessment attendance feedback without a draft appointment`)
        return
      }
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
        let basePath
        let redirectPath
        if (draftBookingId) {
          const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(req, res, 'service-provider')
          if (fetchResult.rendered) {
            return
          }
          const { draft } = fetchResult
          const draftAppointment = draft.data as DraftAppointment
          if (draftAppointment) {
            this.createOrUpdateDraftAttendance(draftAppointment, data)
          } else {
            throw new Error('Draft appointment data is missing.')
          }

          await this.draftsService.updateDraft(draft.id, draft.data, { userId: res.locals.user.userId })

          basePath = `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/edit/${draftBookingId}`
          redirectPath =
            draftAppointment.session!.attendanceFeedback.didSessionHappen === false ? 'no-session' : 'behaviour'
        } else {
          const updatedAppointment = await this.interventionsService.recordSupplierAssessmentAppointmentAttendance(
            accessToken,
            referralId,
            data.paramsForUpdate
          )
          basePath = `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback`
          redirectPath =
            updatedAppointment.appointmentFeedback?.attendanceFeedback.didSessionHappen === false
              ? 'no-session'
              : 'behaviour'
        }

        res.redirect(`${basePath}/${redirectPath}`)
        return
      }
    }

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new InitialAssessmentAttendanceFeedbackPresenter(
      appointment,
      serviceUser,
      appointmentSummary,
      referralId,
      draftBookingId,
      formError,
      userInputData
    )
    const view = new AttendanceFeedbackView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async addSupplierAssessmentSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id
    const { draftBookingId } = req.params

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointment = await this.getSupplierAssessmentAppointmentFromDraftOrService(
      req,
      res,
      supplierAssessment,
      referralId
    )

    if (appointment === null) {
      if (draftBookingId) {
        logger.warn(`Attempting to add initial assessment session feedback without a draft appointment`)
        return
      }
      throw new Error('Attempting to add initial assessment session feedback without a current appointment')
    }

    // Can be removed 2 weeks after iteration 2 version 4 changes to session feedback
    await this.redirectIfSupplierAssessmentDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      referralId,
      draftBookingId
    )

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null
    if (req.method === 'POST') {
      const data = await new SessionFeedbackForm(req, serviceUser, true).data()
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        let redirectUrl
        if (draftBookingId) {
          const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(req, res, 'service-provider')
          if (fetchResult.rendered) {
            return
          }
          const { draft } = fetchResult
          const draftAppointment = draft.data as DraftAppointment
          if (draftAppointment && draftAppointment.session) {
            draftAppointment.session.sessionFeedback.sessionSummary = data.paramsForUpdate.sessionSummary!
            draftAppointment.session.sessionFeedback.sessionResponse = data.paramsForUpdate.sessionResponse!
            draftAppointment.session.sessionFeedback.notifyProbationPractitioner =
              data.paramsForUpdate.notifyProbationPractitioner!
            draftAppointment.session.sessionFeedback.sessionConcerns =
              data.paramsForUpdate.notifyProbationPractitioner === true ? data.paramsForUpdate.sessionConcerns! : null
            draftAppointment.session.sessionFeedback.late = data.paramsForUpdate.late!
            draftAppointment.session.sessionFeedback.lateReason =
              data.paramsForUpdate.late === true ? data.paramsForUpdate.lateReason! : null
            draftAppointment.session.sessionFeedback.futureSessionPlans = data.paramsForUpdate.futureSessionPlans
              ? data.paramsForUpdate.futureSessionPlans
              : null
          } else {
            throw new Error('Draft appointment data is missing.')
          }

          await this.draftsService.updateDraft(draft.id, draft.data, { userId: res.locals.user.userId })

          redirectUrl = `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/edit/${draftBookingId}/check-your-answers`
        } else {
          await this.interventionsService.recordSupplierAssessmentAppointmentSessionFeedback(
            accessToken,
            referralId,
            data.paramsForUpdate
          )
          redirectUrl = `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/check-your-answers`
        }

        res.redirect(redirectUrl)
        return
      }
    }

    const presenter = new InitialAssessmentSessionFeedbackPresenter(
      appointment,
      serviceUser,
      referralId,
      draftBookingId,
      formError,
      userInputData
    )
    const view = new SessionFeedbackView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async addSupplierAssessmentNoSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id
    const { draftBookingId } = req.params

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointment = await this.getSupplierAssessmentAppointmentFromDraftOrService(
      req,
      res,
      supplierAssessment,
      referralId
    )

    if (appointment === null) {
      if (draftBookingId) {
        logger.warn(`Attempting to add initial assessment session feedback without a draft appointment`)
        return
      }
      throw new Error('Attempting to add initial assessment session feedback without a current appointment')
    }

    // Can be removed 2 weeks after iteration 2 version 4 changes to session feedback
    await this.redirectIfSupplierAssessmentDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      referralId,
      draftBookingId
    )

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null
    let data: FormData<Partial<AppointmentSession>>

    if (req.method === 'POST') {
      const { attended } = appointment.appointmentFeedback.attendanceFeedback
      if (attended === 'yes') {
        data = await new NoSessionYesAttendedFeedbackForm(req).data()
      } else if (attended === 'no') {
        data = await new NoSessionNoAttendedFeedbackForm(req).data()
      } else {
        throw new Error('Draft appointment data is missing.')
      }
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        let redirectUrl
        if (draftBookingId) {
          const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(req, res, 'service-provider')
          if (fetchResult.rendered) {
            return
          }
          const { draft } = fetchResult
          const draftAppointment = draft.data as DraftAppointment
          if (draftAppointment && draftAppointment.session) {
            await this.updateDraftSessionFeedback(
              draftAppointment,
              data.paramsForUpdate,
              appointment.appointmentFeedback.attendanceFeedback.attended
            )
          } else {
            throw new Error('Draft appointment data is missing.')
          }

          await this.draftsService.updateDraft(draft.id, draft.data, { userId: res.locals.user.userId })

          redirectUrl = `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/edit/${draftBookingId}/check-your-answers`
        } else {
          await this.interventionsService.recordSupplierAssessmentAppointmentSessionFeedback(
            accessToken,
            referralId,
            data.paramsForUpdate
          )
          redirectUrl = `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/check-your-answers`
        }

        res.redirect(redirectUrl)
        return
      }
    }

    const presenter = new InitialAssessmentNoSessionFeedbackPresenter(
      appointment,
      serviceUser,
      referralId,
      draftBookingId,
      formError,
      userInputData
    )
    const view = new NoSessionFeedbackView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async checkSupplierAssessmentFeedbackAnswers(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id
    const { draftBookingId } = req.params

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(accessToken, referralId),
      this.interventionsService.getSupplierAssessment(accessToken, referralId),
    ])
    const appointment = await this.getSupplierAssessmentAppointmentFromDraftOrService(
      req,
      res,
      supplierAssessment,
      referralId
    )

    if (appointment === null) {
      if (draftBookingId) {
        logger.warn(`Attempting to check supplier assessment feedback answers without a draft appointment`)
        return
      }
      throw new Error('Attempting to check supplier assessment feedback answers without a current appointment')
    }

    // Can be removed 2 weeks after iteration 2 version 4 changes to session feedback
    await this.redirectIfSupplierAssessmentDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      referralId,
      draftBookingId
    )

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)

    const presenter = new InitialAssessmentFeedbackCheckAnswersPresenter(
      appointment,
      serviceUser,
      referralId,
      appointmentSummary,
      draftBookingId
    )
    const view = new CheckFeedbackAnswersView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async submitSupplierAssessmentFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id
    const { draftBookingId } = req.params

    const supplierAssessment = await this.interventionsService.getSupplierAssessment(accessToken, referralId)

    const appointment = await this.getSupplierAssessmentAppointmentFromDraftOrService(
      req,
      res,
      supplierAssessment,
      referralId
    )
    if (appointment === null) {
      if (draftBookingId) {
        logger.warn(`Attempting to submit supplier assessment feedback without a draft appointment`)
        return
      }
      throw new Error('Attempting to submit supplier assessment feedback without a current appointment')
    }

    // Can be removed 2 weeks after iteration 2 version 4 changes to session feedback
    await this.redirectIfSupplierAssessmentDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      referralId,
      draftBookingId
    )

    if (draftBookingId) {
      const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(req, res, 'service-provider')
      if (fetchResult.rendered) {
        return
      }
      const { draft } = fetchResult
      const draftAppointment = draft.data as DraftAppointment
      if (draftAppointment && draftAppointment.session) {
        const data: CreateAppointmentSchedulingAndFeedback = {
          appointmentTime: draftAppointment.appointmentTime,
          durationInMinutes: draftAppointment.durationInMinutes,
          appointmentDeliveryType: draftAppointment.appointmentDeliveryType,
          sessionType: draftAppointment.sessionType,
          appointmentDeliveryAddress: draftAppointment.appointmentDeliveryAddress,
          npsOfficeCode: draftAppointment.npsOfficeCode,
          attendanceFeedback: { ...draftAppointment.session.attendanceFeedback },
          sessionFeedback: { ...draftAppointment.session.sessionFeedback },
        }
        await this.interventionsService.scheduleAndSubmitSupplierAssessmentAppointmentWithFeedback(
          accessToken,
          supplierAssessment.id,
          data
        )
        await this.draftsService.deleteDraft(draft.id, { userId: res.locals.user.userId })
      } else {
        throw new Error('Draft appointment data is missing.')
      }
    } else {
      await this.interventionsService.submitSupplierAssessmentAppointmentFeedback(accessToken, referralId)
    }
    const notifyPP = appointment.appointmentFeedback.sessionFeedback.notifyProbationPractitioner
    const didNotAttend = appointment.appointmentFeedback.attendanceFeedback.attended === 'no'

    res.redirect(
      `/service-provider/referrals/${referralId}/progress?showFeedbackBanner=true&notifyPP=${notifyPP}&dna=${didNotAttend}&saa=true`
    )
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
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, supplierAssessmentAppointment, referral)
    const presenter = new SubmittedFeedbackPresenter(
      supplierAssessmentAppointment,
      appointmentSummary,
      serviceUser,
      userType,
      referralId,
      true
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, userType)
  }

  async addActionPlanSessionAppointmentAttendanceFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber, draftBookingId } = req.params

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null

    const data = await new AttendanceFeedbackForm(req).data()
    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)

    if (req.method === 'POST') {
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        let basePath
        let redirectPath
        if (draftBookingId) {
          const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(
            req,
            res,
            'service-provider',
            actionPlan.referralId
          )
          if (fetchResult.rendered) {
            return
          }
          const { draft } = fetchResult
          const draftAppointment = draft.data as DraftAppointment
          if (draftAppointment) {
            this.createOrUpdateDraftAttendance(draftAppointment, data)
          } else {
            throw new Error('Draft appointment data is missing.')
          }

          await this.draftsService.updateDraft(draft.id, draft.data, { userId: res.locals.user.userId })

          basePath = `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/edit/${draftBookingId}`
          redirectPath =
            draftAppointment.session!.attendanceFeedback.didSessionHappen === false ? 'no-session' : 'behaviour'
        } else {
          const appointment = await this.getActionPlanAppointmentFromDraftOrService(req, res, actionPlan.referralId)
          const updatedAppointment = await this.interventionsService.recordActionPlanAppointmentAttendance(
            accessToken,
            actionPlan.referralId,
            appointment!.appointmentId!,
            data.paramsForUpdate
          )
          basePath = `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback`
          redirectPath =
            updatedAppointment.appointmentFeedback?.attendanceFeedback.didSessionHappen === false
              ? 'no-session'
              : 'behaviour'
        }
        res.redirect(`${basePath}/${redirectPath}`)
        return
      }
    }
    const appointment = await this.getActionPlanAppointmentFromDraftOrService(req, res, actionPlan.referralId)
    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)

    // return because draft service already renders page.
    if (appointment === null) {
      return
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
      appointment,
      serviceUser,
      appointmentSummary,
      referral.id,
      actionPlan.id,
      draftBookingId,
      formError,
      userInputData
    )
    const view = new AttendanceFeedbackView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async addActionPlanSessionAppointmentSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber, draftBookingId } = req.params
    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null
    const appointment = await this.getActionPlanAppointmentFromDraftOrService(req, res, referral.id)
    // return because draft service already renders page.
    if (appointment === null) {
      return
    }

    // To be removed 2 weeks after deploying Iteration 2 version 4
    await this.redirectIfDeliverySessionDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      actionPlanId,
      sessionNumber,
      draftBookingId
    )

    if (req.method === 'POST') {
      const data = await new SessionFeedbackForm(req, serviceUser, false).data()
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        let redirectUrl
        if (!draftBookingId) {
          await this.interventionsService.recordActionPlanAppointmentSessionFeedback(
            accessToken,
            referral.id,
            appointment.appointmentId!,
            data.paramsForUpdate
          )
          redirectUrl = `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/check-your-answers`
        } else {
          const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(
            req,
            res,
            'service-provider',
            actionPlan.referralId
          )
          if (fetchResult.rendered) {
            return
          }
          const { draft } = fetchResult
          const draftAppointment = draft.data as DraftAppointment
          if (draftAppointment && draftAppointment.session) {
            draftAppointment.session.sessionFeedback.sessionSummary = data.paramsForUpdate.sessionSummary!
            draftAppointment.session.sessionFeedback.sessionResponse = data.paramsForUpdate.sessionResponse!
            draftAppointment.session.sessionFeedback.notifyProbationPractitioner =
              data.paramsForUpdate.notifyProbationPractitioner!
            draftAppointment.session.sessionFeedback.sessionConcerns =
              data.paramsForUpdate.notifyProbationPractitioner === true ? data.paramsForUpdate.sessionConcerns! : null
            draftAppointment.session.sessionFeedback.late = data.paramsForUpdate.late!
            draftAppointment.session.sessionFeedback.lateReason =
              data.paramsForUpdate.late === true ? data.paramsForUpdate.lateReason! : null
            draftAppointment.session.sessionFeedback.futureSessionPlans = data.paramsForUpdate.futureSessionPlans
              ? data.paramsForUpdate.futureSessionPlans
              : null
          } else {
            throw new Error('Draft appointment data is missing.')
          }

          await this.draftsService.updateDraft(draft.id, draft.data, { userId: res.locals.user.userId })

          redirectUrl = `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/edit/${draftBookingId}/check-your-answers`
        }

        res.redirect(redirectUrl)
        return
      }
    }

    const presenter = new ActionPlanSessionFeedbackPresenter(
      appointment,
      serviceUser,
      actionPlanId,
      formError,
      userInputData,
      draftBookingId
    )
    const view = new SessionFeedbackView(presenter)

    res.status(formError === null ? 200 : 400)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  // To be removed 2 weeks after deploying Iteration 2 version 4
  private async redirectIfDeliverySessionDidSessionHappenIsNull(
    res: Response,
    didSessionHappen: boolean | null | undefined,
    actionPlanId: string,
    sessionNumber: string,
    draftBookingId: string | null | undefined
  ) {
    if (didSessionHappen === null || didSessionHappen === undefined) {
      if (draftBookingId) {
        res.redirect(
          `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/edit/${draftBookingId}/attendance`
        )
      }
      res.redirect(
        `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/attendance`
      )
    }
  }

  // To be removed 2 weeks after deploying Iteration 2 version 4
  private async redirectIfSupplierAssessmentDidSessionHappenIsNull(
    res: Response,
    didSessionHappen: boolean | null | undefined,
    referralId: string,
    draftBookingId: string | null | undefined
  ) {
    if (didSessionHappen === null || didSessionHappen === undefined) {
      if (draftBookingId) {
        res.redirect(
          `/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/edit/${draftBookingId}/attendance`
        )
      }
      res.redirect(`/service-provider/referrals/${referralId}/supplier-assessment/post-assessment-feedback/attendance`)
    }
  }

  async checkActionPlanSessionFeedbackAnswers(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, draftBookingId, sessionNumber } = req.params

    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)

    const appointment = await this.getActionPlanAppointmentFromDraftOrService(req, res, referral.id)
    // return because draft service already renders page.
    if (appointment === null) {
      return
    }

    // To be removed 2 weeks after deploying Iteration 2 version 4
    await this.redirectIfDeliverySessionDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      actionPlanId,
      sessionNumber,
      draftBookingId
    )

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, appointment, referral)
    const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
      appointment,
      serviceUser,
      actionPlanId,
      appointmentSummary,
      draftBookingId
    )
    const view = new CheckFeedbackAnswersView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
  }

  async submitActionPlanSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber, draftBookingId } = req.params
    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)

    const appointment = await this.getActionPlanAppointmentFromDraftOrService(req, res, actionPlan.referralId)
    if (appointment === null) {
      if (draftBookingId) {
        logger.warn(`Attempting to submit action plan appointment feedback without a draft appointment`)
        return
      }
      throw new Error('Attempting to submit action plan appointment feedback without a current appointment')
    }

    // To be removed 2 weeks after deploying Iteration 2 version 4
    await this.redirectIfDeliverySessionDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      actionPlanId,
      sessionNumber,
      draftBookingId
    )

    if (draftBookingId) {
      const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(
        req,
        res,
        'service-provider',
        actionPlan.referralId
      )
      if (fetchResult.rendered) {
        return
      }
      const { draft } = fetchResult
      const draftAppointment = draft.data as DraftAppointment
      if (draftAppointment && draftAppointment.session) {
        const data: CreateAppointmentSchedulingAndFeedback = {
          appointmentTime: draftAppointment.appointmentTime,
          durationInMinutes: draftAppointment.durationInMinutes,
          appointmentDeliveryType: draftAppointment.appointmentDeliveryType,
          sessionType: draftAppointment.sessionType,
          appointmentDeliveryAddress: draftAppointment.appointmentDeliveryAddress,
          npsOfficeCode: draftAppointment.npsOfficeCode,
          attendanceFeedback: { ...draftAppointment.session.attendanceFeedback },
          sessionFeedback: { ...draftAppointment.session.sessionFeedback },
        }

        const success = await this.updateSessionAppointmentAndCheckForConflicts(
          accessToken,
          actionPlanId,
          Number(sessionNumber),
          data
        )
        if (success === false) {
          res.redirect(
            `/service-provider/action-plan/${actionPlanId}/sessions/${sessionNumber}/edit/${draftBookingId}/details?clash=true`
          )
          return
        }

        await this.draftsService.deleteDraft(draft.id, { userId: res.locals.user.userId })
      } else {
        throw new Error('Draft appointment data is missing.')
      }
    } else {
      await this.interventionsService.submitActionPlanSessionFeedback(
        accessToken,
        actionPlan.referralId,
        appointment.appointmentId!
      )
    }
    const notifyPP = appointment.appointmentFeedback.sessionFeedback.notifyProbationPractitioner
    const didNotAttend = appointment.appointmentFeedback.attendanceFeedback.attended === 'no'

    res.redirect(
      `/service-provider/referrals/${actionPlan.referralId}/progress?showFeedbackBanner=true&notifyPP=${notifyPP}&dna=${didNotAttend}&saa=false`
    )
  }

  async addActionPlanNoSessionAppointmentSessionFeedback(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { actionPlanId, sessionNumber, draftBookingId } = req.params
    const actionPlan = await this.interventionsService.getActionPlan(accessToken, actionPlanId)
    const referral = await this.interventionsService.getSentReferral(accessToken, actionPlan.referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointment = await this.getActionPlanAppointmentFromDraftOrService(req, res, referral.id)
    // return because draft service already renders page.
    if (appointment === null) {
      return
    }

    // To be removed 2 weeks after deploying Iteration 2 version 4
    await this.redirectIfDeliverySessionDidSessionHappenIsNull(
      res,
      appointment.appointmentFeedback.attendanceFeedback.didSessionHappen,
      actionPlanId,
      sessionNumber,
      draftBookingId
    )

    let formError: FormValidationError | null = null
    let userInputData: Record<string, unknown> | null = null
    let data: FormData<Partial<AppointmentSession>>

    if (req.method === 'POST') {
      const { attended } = appointment.appointmentFeedback.attendanceFeedback
      if (attended === 'yes') {
        data = await new NoSessionYesAttendedFeedbackForm(req).data()
      } else if (attended === 'no') {
        data = await new NoSessionNoAttendedFeedbackForm(req).data()
      } else {
        throw new Error('Draft appointment data is missing.')
      }
      if (data.error) {
        res.status(400)
        formError = data.error
        userInputData = req.body
      } else {
        let redirectUrl
        if (!draftBookingId) {
          await this.interventionsService.recordActionPlanAppointmentSessionFeedback(
            accessToken,
            referral.id,
            appointment.appointmentId!,
            data.paramsForUpdate
          )
          redirectUrl = `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/check-your-answers`
        } else {
          const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(
            req,
            res,
            'service-provider',
            actionPlan.referralId
          )
          if (fetchResult.rendered) {
            return
          }
          const { draft } = fetchResult
          const draftAppointment = draft.data as DraftAppointment
          if (draftAppointment && draftAppointment.session) {
            await this.updateDraftSessionFeedback(
              draftAppointment,
              data.paramsForUpdate,
              appointment.appointmentFeedback.attendanceFeedback.attended
            )
          } else {
            throw new Error('Draft appointment data is missing.')
          }

          await this.draftsService.updateDraft(draft.id, draft.data, { userId: res.locals.user.userId })

          redirectUrl = `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/edit/${draftBookingId}/check-your-answers`
        }

        res.redirect(redirectUrl)
        return
      }
    }

    const presenter = new ActionPlanNoSessionFeedbackPresenter(
      appointment,
      serviceUser,
      actionPlanId,
      formError,
      userInputData,
      draftBookingId
    )
    const view = new NoSessionFeedbackView(presenter)

    res.status(formError === null ? 200 : 400)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'service-provider')
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

  /* eslint-disable no-param-reassign */
  private async updateDraftSessionFeedback(
    draftAppointment: DraftAppointment,
    paramsForUpdate: Partial<AppointmentSession>,
    attended: Attended
  ) {
    if (draftAppointment && draftAppointment.session) {
      if (attended === 'yes') {
        draftAppointment.session.sessionFeedback.noSessionReasonType = paramsForUpdate.noSessionReasonType!
        draftAppointment.session.sessionFeedback.noSessionReasonPopAcceptable =
          paramsForUpdate.noSessionReasonPopAcceptable ? paramsForUpdate.noSessionReasonPopAcceptable : null
        draftAppointment.session.sessionFeedback.noSessionReasonPopUnacceptable =
          paramsForUpdate.noSessionReasonPopUnacceptable ? paramsForUpdate.noSessionReasonPopUnacceptable : null
        draftAppointment.session.sessionFeedback.noSessionReasonLogistics = paramsForUpdate.noSessionReasonLogistics
          ? paramsForUpdate.noSessionReasonLogistics
          : null
        // draftAppointment.session.sessionFeedback.noSessionReasonOther = paramsForUpdate.noSessionReasonOther
        //   ? paramsForUpdate.noSessionReasonOther
        //   : null
        draftAppointment.session.sessionFeedback.notifyProbationPractitioner =
          paramsForUpdate.notifyProbationPractitioner!
        draftAppointment.session.sessionFeedback.sessionConcerns =
          paramsForUpdate.notifyProbationPractitioner === true ? paramsForUpdate.sessionConcerns! : null
      }
      if (attended === 'no') {
        draftAppointment.session.sessionFeedback.noAttendanceInformation = paramsForUpdate.noAttendanceInformation!
        draftAppointment.session.sessionFeedback.notifyProbationPractitioner =
          paramsForUpdate.notifyProbationPractitioner!
        draftAppointment.session.sessionFeedback.sessionConcerns =
          paramsForUpdate.notifyProbationPractitioner === true ? paramsForUpdate.sessionConcerns! : null
      }
    } else {
      throw new Error('Draft appointment data is missing.')
    }
  }
  /* eslint-enable no-param-reassign */

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
    const submittedByUsername = appointment?.appointmentFeedback.submittedBy?.username
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

  async viewSubmittedActionPlanSessionFeedback(
    req: Request,
    res: Response,
    userType: 'service-provider' | 'probation-practitioner'
  ): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { sessionNumber, actionPlanId, appointmentId } = req.params
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

    const appointmentToReturn = {
      sessionNumber: currentAppointment.sessionNumber,
      id: appointmentId,
      oldAppointments: [],
      ...(currentAppointment.oldAppointments?.filter(x => x.appointmentId && x.appointmentId === appointmentId)[0] ??
        currentAppointment),
    } as ActionPlanAppointment

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const presenter = new SubmittedFeedbackPresenter(
      appointmentToReturn,
      await this.createAppointmentSummary(accessToken, appointmentToReturn, referral),
      serviceUser,
      userType,
      referral.id,
      false
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, userType)
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

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const appointmentSummary = await this.createAppointmentSummary(accessToken, currentAppointment, referral)
    const presenter = new SubmittedFeedbackPresenter(
      currentAppointment,
      appointmentSummary,
      serviceUser,
      'probation-practitioner',
      referral.id,
      false,
      null
    )
    const view = new SubmittedFeedbackView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  // TODO: Remove DraftAppointmentBooking from here once this has gone live for at least a week.
  private async fetchDraftAppointmentOrRenderMessage(
    req: Request,
    res: Response,
    userType: 'service-provider' | 'probation-practitioner',
    referralId?: string
  ) {
    const backLink = {
      target: `/service-provider/referrals/${referralId || req.params.id}/progress`,
      message: 'book or change the appointment',
    }
    return ControllerUtils.fetchDraftOrRenderMessage<DraftAppointmentBooking | DraftAppointment>(
      req,
      res,
      this.draftsService,
      userType,
      {
        idParamName: 'draftBookingId',
        notFoundUserMessage:
          'You have not saved the appointment details. This is because too much time has passed since you started.',
        typeName: 'booking',
        backLink,
      }
    )
  }

  private async fetchDraftBookingOrRenderMessage(
    req: Request,
    res: Response,
    userType: 'service-provider' | 'probation-practitioner'
  ) {
    const backLink = {
      target: `/service-provider/referrals/${req.params.id}/progress`,
      message: 'book or change the appointment',
    }
    return ControllerUtils.fetchDraftOrRenderMessage<DraftAppointmentBooking>(req, res, this.draftsService, userType, {
      idParamName: 'draftBookingId',
      notFoundUserMessage:
        'You have not saved the appointment details. This is because too much time has passed since you started.',
      typeName: 'booking',
      backLink,
    })
  }

  private extractAppointmentSchedulingDetails(
    draft: Draft<DraftAppointmentBooking | DraftAppointment>
  ): AppointmentSchedulingDetails | null {
    if (draft?.data) {
      return draft.data
    }
    return null
  }

  private extractActionPlanAppointment(
    fetchResult: DraftFetchSuccessResult<DraftAppointmentBooking | DraftAppointment>,
    sessionNumber: string
  ): ActionPlanAppointment | null {
    const { draft } = fetchResult
    const appointmentSchedulingDetails = this.extractAppointmentSchedulingDetails(draft)
    if (appointmentSchedulingDetails) {
      const draftAppointment = draft.data as DraftAppointment
      if (draftAppointment?.session) {
        return {
          appointmentFeedback: draftAppointment.session,
          sessionNumber: Number(sessionNumber),
          ...appointmentSchedulingDetails,
        }
      }
      return {
        appointmentFeedback: {
          attendanceFeedback: {
            didSessionHappen: null,
            attended: null,
            additionalAttendanceInformation: null,
            attendanceFailureInformation: null,
          },
          sessionFeedback: {
            late: null,
            lateReason: null,
            notifyProbationPractitioner: null,
            sessionSummary: null,
            sessionResponse: null,
            sessionConcerns: null,
            futureSessionPlans: null,
            noSessionReasonType: null,
            noSessionReasonPopAcceptable: null,
            noSessionReasonPopUnacceptable: null,
            noSessionReasonLogistics: null,
            // noSessionReasonOther: null,
            noAttendanceInformation: null,
          },
          submitted: false,
          submittedBy: null,
        },

        sessionNumber: Number(sessionNumber),
        ...appointmentSchedulingDetails,
      }
    }
    return null
  }

  private async getActionPlanAppointmentFromDraftOrService(
    req: Request,
    res: Response,
    referralId?: string
  ): Promise<ActionPlanAppointment | null> {
    const { user } = res.locals
    const { accessToken } = user.token
    const { draftBookingId, sessionNumber, actionPlanId } = req.params
    if (draftBookingId) {
      const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(req, res, 'service-provider', referralId)
      if (fetchResult.rendered) {
        return null
      }
      const extractedAppointment = this.extractActionPlanAppointment(fetchResult, sessionNumber)
      if (extractedAppointment === null) {
        throw new Error('No draft appointment could be found.')
      }
      return extractedAppointment
    }
    return this.interventionsService.getActionPlanAppointment(accessToken, actionPlanId, Number(sessionNumber))
  }

  private extractSupplierAssessmentAppointment(
    fetchResult: DraftFetchSuccessResult<DraftAppointmentBooking | DraftAppointment>,
    id: string
  ): InitialAssessmentAppointment | null {
    const { draft } = fetchResult
    const appointmentSchedulingDetails = this.extractAppointmentSchedulingDetails(draft)
    if (appointmentSchedulingDetails) {
      const draftAppointment = draft.data as DraftAppointment
      if (draftAppointment?.session) {
        return {
          appointmentFeedback: draftAppointment.session,
          id,
          ...appointmentSchedulingDetails,
        }
      }
      return {
        appointmentFeedback: {
          attendanceFeedback: {
            didSessionHappen: null,
            attended: null,
            additionalAttendanceInformation: null,
            attendanceFailureInformation: null,
          },
          sessionFeedback: {
            late: null,
            lateReason: null,
            notifyProbationPractitioner: null,
            sessionSummary: null,
            sessionResponse: null,
            sessionConcerns: null,
            futureSessionPlans: null,
            noSessionReasonType: null,
            noSessionReasonPopAcceptable: null,
            noSessionReasonPopUnacceptable: null,
            noSessionReasonLogistics: null,
            // noSessionReasonOther: null,
            noAttendanceInformation: null,
          },
          submitted: false,
          submittedBy: null,
        },
        id: 'null',
        ...appointmentSchedulingDetails,
      }
    }
    return null
  }

  private async getSupplierAssessmentAppointmentFromDraftOrService(
    req: Request,
    res: Response,
    supplierAssessment: SupplierAssessment,
    referralId?: string
  ): Promise<InitialAssessmentAppointment | null> {
    const { draftBookingId, id } = req.params
    if (draftBookingId) {
      const fetchResult = await this.fetchDraftAppointmentOrRenderMessage(req, res, 'service-provider', referralId)
      if (fetchResult.rendered) {
        return null
      }
      const extractedAppointment = this.extractSupplierAssessmentAppointment(fetchResult, id)
      if (extractedAppointment === null) {
        throw new Error('No draft appointment could be found.')
      }
      return extractedAppointment
    }
    return new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
  }

  private isAPastAppointment(appointmentSchedulingDetails: AppointmentSchedulingDetails): boolean {
    if (!appointmentSchedulingDetails.appointmentTime) {
      throw new Error('No appointment time exists on appointment.')
    }
    return new Date(appointmentSchedulingDetails.appointmentTime) < new Date()
  }

  /* eslint-disable no-param-reassign */
  private createOrUpdateDraftAttendance(
    draftAppointment: DraftAppointment,
    data: FormData<Partial<AppointmentAttendanceFormDetails>>
  ): void {
    if (draftAppointment && data.paramsForUpdate) {
      if (draftAppointment.session) {
        if (!data.paramsForUpdate.didSessionHappen!) {
          draftAppointment.session.sessionFeedback = {
            late: null,
            lateReason: null,
            notifyProbationPractitioner: null,
            sessionSummary: null,
            sessionResponse: null,
            sessionConcerns: null,
            futureSessionPlans: null,
            noSessionReasonType: null,
            noSessionReasonPopAcceptable: null,
            noSessionReasonPopUnacceptable: null,
            noSessionReasonLogistics: null,
            // noSessionReasonOther: null,
            noAttendanceInformation: null,
          }
          draftAppointment.session.attendanceFeedback.didSessionHappen = false
          draftAppointment.session.attendanceFeedback.attended = data.paramsForUpdate.attended!
          // Need to set on new page later on.
          // draftAppointment.session.attendanceFeedback.attendanceFailureInformation =
          //   data.paramsForUpdate.attendanceFailureInformation!
        } else {
          draftAppointment.session.attendanceFeedback.didSessionHappen = data.paramsForUpdate.didSessionHappen
          draftAppointment.session.attendanceFeedback.attended = 'yes'
          // draftAppointment.session.attendanceFeedback.attendanceFailureInformation = null
        }
        draftAppointment.session.attendanceFeedback.attended = data.paramsForUpdate.attended! // What's this for???
      } else {
        draftAppointment.session = {
          attendanceFeedback: {
            didSessionHappen: data.paramsForUpdate.didSessionHappen!,
            attended: data.paramsForUpdate.didSessionHappen ? 'yes' : data.paramsForUpdate.attended!,
            attendanceFailureInformation: data.paramsForUpdate.attendanceFailureInformation!, // needs to be moved later
          },
          sessionFeedback: {
            late: null,
            lateReason: null,
            notifyProbationPractitioner: null,
            sessionSummary: null,
            sessionResponse: null,
            sessionConcerns: null,
            futureSessionPlans: null,
            noSessionReasonType: null,
            noSessionReasonPopAcceptable: null,
            noSessionReasonPopUnacceptable: null,
            noSessionReasonLogistics: null,
            // noSessionReasonOther: null,
            noAttendanceInformation: null,
          },
          submitted: false,
          submittedBy: null,
        }
      }
    }
  }
  /* eslint-enable no-param-reassign */
}
