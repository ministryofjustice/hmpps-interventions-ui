import { ActionPlanAppointment } from '../../models/actionPlan'
import Appointment from '../../models/appointment'
import PresenterUtils from '../../utils/presenterUtils'
import { FormValidationError } from '../../utils/formValidationError'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import SentReferral from '../../models/sentReferral'

export default class ScheduleAppointmentPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly currentAppointment: Appointment | ActionPlanAppointment | null,
    private readonly validationError: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly serverError: FormValidationError | null = null,
    private readonly overrideBackLinkHref?: string
  ) {}

  readonly text = {
    title: this.currentAppointment ? 'Change appointment details' : 'Add appointment details',
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly errorSummary = this.serverError
    ? PresenterUtils.errorSummary(this.serverError)
    : PresenterUtils.errorSummary(this.validationError)

  readonly serverErrorMessage = PresenterUtils.errorMessage(this.serverError, 'session-input')

  private readonly appointmentDecorator = this.currentAppointment
    ? new AppointmentDecorator(this.currentAppointment)
    : null

  readonly fields = {
    date: this.utils.dateValue(this.appointmentDecorator?.britishDay ?? null, 'date', this.validationError),
    time: this.utils.twelveHourTimeValue(this.appointmentDecorator?.britishTime ?? null, 'time', this.validationError),
    duration: this.utils.durationValue(this.appointmentDecorator?.duration ?? null, 'duration', this.validationError),
  }

  readonly backLinkHref = this.overrideBackLinkHref ?? `/service-provider/referrals/${this.referral.id}/progress`
}
