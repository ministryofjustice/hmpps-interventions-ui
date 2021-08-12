import AppointmentDecorator from '../../../../../decorators/appointmentDecorator'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'

export default class BehaviourFeedbackQuestionnaire {
  private readonly appointmentDecorator: AppointmentDecorator

  constructor(
    private appointment: InitialAssessmentAppointment | ActionPlanAppointment,
    private serviceUser: DeliusServiceUser
  ) {
    this.appointmentDecorator = new AppointmentDecorator(appointment)
  }

  get behaviourQuestion(): { text: string; hint: string } {
    if (this.appointmentDecorator.isInitialAssessmentAppointment) {
      return {
        text: `Describe ${this.serviceUser.firstName}'s behaviour in the assessment appointment`,
        hint: 'For example, consider how well-engaged they were and what their body language was like.',
      }
    }
    return {
      text: `Describe ${this.serviceUser.firstName}'s behaviour in this session`,
      hint: 'For example, consider how well-engaged they were and what their body language was like.',
    }
  }

  get notifyProbationPractitionerQuestion(): { text: string; hint: string; explanation: string } {
    return {
      text: 'If you described poor behaviour, do you want to notify the probation practitioner?',
      explanation: 'If you select yes, the probation practitioner will be notified by email.',
      hint: 'Select one option',
    }
  }
}
