import { ActionPlanAppointment } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import Duration from '../../utils/duration'
import PresenterUtils from '../../utils/presenterUtils'
import ClockTime from '../../utils/clockTime'

export default class EditSessionPresenter {
  constructor(private readonly appointment: ActionPlanAppointment) {}

  readonly text = {
    title: `Add session ${this.appointment.sessionNumber} details`,
  }

  private readonly utils = new PresenterUtils(null)

  readonly fields = {
    date: this.utils.dateValue(
      this.appointment.appointmentTime === null
        ? null
        : CalendarDay.britishDayForDate(new Date(this.appointment.appointmentTime)),
      '',
      null
    ),
    time: this.utils.twelveHourTimeValue(
      this.appointment.appointmentTime === null
        ? null
        : ClockTime.britishTimeForDate(new Date(this.appointment.appointmentTime)),
      '',
      null
    ),
    duration: this.utils.durationValue(
      this.appointment.durationInMinutes === null ? null : Duration.fromUnits(0, this.appointment.durationInMinutes, 0),
      '',
      null
    ),
  }
}
