import { ActionPlanAppointment, InitialAssessmentAppointment } from '../models/appointment'
import CalendarDay from '../utils/calendarDay'
import ClockTime from '../utils/clockTime'
import Duration from '../utils/duration'

export default class AppointmentDecorator {
  constructor(private readonly appointment: InitialAssessmentAppointment | ActionPlanAppointment) {}

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

  get britishEndsAtTime(): ClockTime | null {
    if (this.appointment.appointmentTime === null || this.appointment.durationInMinutes === null) {
      return null
    }

    const startsAt = new Date(this.appointment.appointmentTime)
    const endsAt = new Date(startsAt.getTime() + this.appointment.durationInMinutes * 60 * 1000)

    return ClockTime.britishTimeForDate(endsAt)
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

  isInitialAssessmentAppointment(appointmentDetails: InitialAssessmentAppointment | ActionPlanAppointment): boolean {
    return (<ActionPlanAppointment>appointmentDetails).sessionNumber === undefined
  }

  appointmentIsInThePast(appointment: InitialAssessmentAppointment | ActionPlanAppointment): boolean {
    return new Date(appointment.appointmentTime!) < new Date()
  }
}
