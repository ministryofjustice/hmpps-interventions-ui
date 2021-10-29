import { Request, Response } from 'express'
import SupplierAssessmentDecorator from '../../decorators/supplierAssessmentDecorator'
import { AppointmentSchedulingDetails } from '../../models/appointment'
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
import SupplierAssessmentAppointmentPresenter from '../shared/supplierAssessmentAppointmentPresenter'
import SupplierAssessmentAppointmentView from '../shared/supplierAssessmentAppointmentView'
import AppointmentSummary from './appointmentSummary'

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

    let assignedCaseworker: AuthUserDetails | null = null
    if (currentAppointment?.sessionFeedback?.submitted) {
      assignedCaseworker = await this.hmppsAuthService.getSPUserByUsername(
        res.locals.user.token.accessToken,
        currentAppointment!.sessionFeedback!.submittedBy!.username
      )
    }
    let appointmentSummary: AppointmentSummary | null = null
    if (currentAppointment) {
      const deliusOfficeLocation = await this.deliusOfficeLocationFilter.findOfficeByAppointment(currentAppointment)
      appointmentSummary = new AppointmentSummary(currentAppointment, assignedCaseworker, deliusOfficeLocation)
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

  async showSupplierAssessmentAppointment(req: Request, res: Response): Promise<void> {
    const referralId = req.params.id

    const [referral, supplierAssessment] = await Promise.all([
      this.interventionsService.getSentReferral(res.locals.user.token.accessToken, referralId),

      this.interventionsService.getSupplierAssessment(res.locals.user.token.accessToken, referralId),
    ])

    const appointment = new SupplierAssessmentDecorator(supplierAssessment).currentAppointment
    if (appointment === null) {
      throw new Error('Attempting to view supplier assessment without a current appointment')
    }
    const deliusOfficeLocation = await this.deliusOfficeLocationFilter.findOfficeByAppointment(appointment)

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new SupplierAssessmentAppointmentPresenter(
      referral,
      appointment,
      new AppointmentSummary(appointment, null, deliusOfficeLocation),
      {
        userType: 'service-provider',
      }
    )
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
    const deliusOfficeLocation = await this.deliusOfficeLocationFilter.findOfficeByAppointment(appointment)
    const presenter = new ScheduleActionPlanSessionPresenter(
      referral,
      appointment,
      new AppointmentSummary(appointment, null, deliusOfficeLocation),
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
}
