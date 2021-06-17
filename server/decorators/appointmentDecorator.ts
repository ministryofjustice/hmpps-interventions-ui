import { ActionPlanAppointment } from '../models/actionPlan'
import Appointment from '../models/appointment'
import CalendarDay from '../utils/calendarDay'
import ClockTime from '../utils/clockTime'
import Duration from '../utils/duration'

export default class AppointmentDecorator {
  constructor(private readonly appointment: Appointment | ActionPlanAppointment) {}

  get britishDay(): CalendarDay | null {
    if (this.appointment.appointmentTime === null) {
      return null
    }

    return CalendarDay.britishDayForDate(new Date(this.appointment.appointmentTime))
  }

  get britishTime(): ClockTime | null {
    if (this.appointment.appointmentTime === null) {
      return null
    }

    return ClockTime.britishTimeForDate(new Date(this.appointment.appointmentTime))
  }

  get duration(): Duration | null {
    if (this.appointment.durationInMinutes === null) {
      return null
    }

    const duration = Duration.fromUnits(0, this.appointment.durationInMinutes, 0)
    if (duration === null) {
      throw new Error('Failed to construct duration')
    }
    return duration
  }
}
