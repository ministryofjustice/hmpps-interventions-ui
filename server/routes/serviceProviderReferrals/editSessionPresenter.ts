import { ActionPlanAppointment } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import Duration from '../../utils/duration'
import PresenterUtils from '../../utils/presenterUtils'
import ClockTime from '../../utils/clockTime'
import { FormValidationError } from '../../utils/formValidationError'

export default class EditSessionPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    title: `Add session ${this.appointment.sessionNumber} details`,
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly fields = {
    date: this.utils.dateValue(
      this.appointment.appointmentTime === null
        ? null
        : CalendarDay.britishDayForDate(new Date(this.appointment.appointmentTime)),
      'date',
      this.error
    ),
    time: this.utils.twelveHourTimeValue(
      this.appointment.appointmentTime === null
        ? null
        : ClockTime.britishTimeForDate(new Date(this.appointment.appointmentTime)),
      'time',
      this.error
    ),
    duration: this.utils.durationValue(
      this.appointment.durationInMinutes === null ? null : Duration.fromUnits(0, this.appointment.durationInMinutes, 0),
      'duration',
      this.error
    ),
  }
}
