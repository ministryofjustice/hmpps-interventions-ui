import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import AppointmentDecorator from '../../../../../decorators/appointmentDecorator'

export default class AttendanceFeedbackQuestionnaire {
  private readonly appointmentDecorator: AppointmentDecorator

  constructor(
    private appointment: InitialAssessmentAppointment | ActionPlanAppointment,
    private serviceUser: DeliusServiceUser
  ) {
    this.appointmentDecorator = new AppointmentDecorator(appointment)
  }

  get attendanceQuestion(): { text: string; hint: string | null } {
    if (this.appointmentDecorator.isInitialAssessmentAppointment) {
      return {
        text: `Did ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} come to the appointment?`,
        hint: 'Select one option',
      }
    }
    return {
      text: `Did ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} attend the session?`,
      hint: null,
    }
  }

  get additionalAttendanceInformationQuestion(): string {
    return `Add additional information about ${this.serviceUser.name.forename}'s attendance:`
  }

  get attendanceFailureInformationQuestion(): string {
    return `Add how you tried to contact ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} and anything you know about why they did not attend.`
  }

  get sessionHappenQuestion(): { text: string; hint: string } {
    return {
      text: `Did the session happen?`,
      hint: `The session happened if something was delivered.`,
    }
  }

  private get methodSpecificAttendanceQuestion(): string {
    switch (this.appointment.appointmentDeliveryType) {
      case 'PHONE_CALL':
        return `Did ${this.serviceUser.name.forename} join this phone call?`
      case 'VIDEO_CALL':
        return `Did ${this.serviceUser.name.forename} join this video call?`
      case 'IN_PERSON_MEETING_OTHER':
      case 'IN_PERSON_MEETING_PROBATION_OFFICE':
        return `Did ${this.serviceUser.name.forename} attend this in-person meeting?`
      default:
        return `Did ${this.serviceUser.name.forename} attend this session?`
    }
  }
}
