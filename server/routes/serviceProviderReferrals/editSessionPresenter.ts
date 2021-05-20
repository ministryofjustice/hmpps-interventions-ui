import { ActionPlanAppointment } from '../../models/actionPlan'
import CalendarDay from '../../utils/calendarDay'
import Duration from '../../utils/duration'
import PresenterUtils from '../../utils/presenterUtils'
import ClockTime from '../../utils/clockTime'
import { FormValidationError } from '../../utils/formValidationError'

export default class EditSessionPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly validationError: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly serverError: FormValidationError | null = null
  ) {}

  readonly text = {
    title: `Add session ${this.appointment.sessionNumber} details`,
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly errorSummary = this.serverError
    ? PresenterUtils.errorSummary(this.serverError)
    : PresenterUtils.errorSummary(this.validationError)

  readonly serverErrorMessage = PresenterUtils.errorMessage(this.serverError, 'session-input')

  readonly fields = {
    date: this.utils.dateValue(
      this.appointment.appointmentTime === null
        ? null
        : CalendarDay.britishDayForDate(new Date(this.appointment.appointmentTime)),
      'date',
      this.validationError
    ),
    time: this.utils.twelveHourTimeValue(
      this.appointment.appointmentTime === null
        ? null
        : ClockTime.britishTimeForDate(new Date(this.appointment.appointmentTime)),
      'time',
      this.validationError
    ),
    duration: this.utils.durationValue(
      this.appointment.durationInMinutes === null ? null : Duration.fromUnits(0, this.appointment.durationInMinutes, 0),
      'duration',
      this.validationError
    ),
  }
}
