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

  get sessionSummaryQuestion(): { text: string; hint: string } {
      return {
        text: `What did you do in the session?`,
        hint: 'Add details about what you did, anything that was achieved and what came out of the session.',
      }
  }

  get sessionResponseQuestion(): { text: string; hint: string } {
    return {
      text: `How did ${this.serviceUser.firstName} ${this.serviceUser.surname} respond to the session?`,
      hint: `Add whether ${this.serviceUser.firstName} ${this.serviceUser.surname} seemed engaged, ` +
          `including any progress or positive changes. This helps the probation practitioner to support them.`,
    }
  }

  get sessionConcernsQuestion(): { text: string} {
    return {
      text: `Add enough detail to help the probation practitioner to know what happened`
    }
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
      text: `Did anything concern you about ${this.serviceUser.firstName} ${this.serviceUser.surname}?`,
      explanation: 'If you select yes, the probation practitioner will get an email about your concerns.',
      hint: 'Select one option',
    }
  }
}
