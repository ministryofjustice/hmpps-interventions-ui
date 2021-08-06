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

  get attendanceQuestion(): { text: string; hint: string } {
    if (this.appointmentDecorator.isInitialAssessmentAppointment) {
      return {
        text: `Did ${this.serviceUser.firstName} attend the initial assessment appointment?`,
        hint: 'Select one option',
      }
    }
    return { text: this.methodSpecificAttendanceQuestion, hint: 'Select one option' }
  }

  get additionalAttendanceInformationQuestion(): string {
    return `Add additional information about ${this.serviceUser.firstName}'s attendance:`
  }

  private get methodSpecificAttendanceQuestion(): string {
    switch (this.appointment.appointmentDeliveryType) {
      case 'PHONE_CALL':
        return `Did ${this.serviceUser.firstName} join this phone call?`
      case 'VIDEO_CALL':
        return `Did ${this.serviceUser.firstName} join this video call?`
      case 'IN_PERSON_MEETING_OTHER':
      case 'IN_PERSON_MEETING_PROBATION_OFFICE':
        return `Did ${this.serviceUser.firstName} attend this in-person meeting?`
      default:
        return `Did ${this.serviceUser.firstName} attend this session?`
    }
  }
}
