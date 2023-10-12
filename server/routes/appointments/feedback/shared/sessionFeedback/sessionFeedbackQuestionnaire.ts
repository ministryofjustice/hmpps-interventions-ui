import AppointmentDecorator from '../../../../../decorators/appointmentDecorator'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'

export default class SessionFeedbackQuestionnaire {
  private readonly appointmentDecorator: AppointmentDecorator

  constructor(
    private appointment: InitialAssessmentAppointment | ActionPlanAppointment,
    private serviceUser: DeliusServiceUser
  ) {
    this.appointmentDecorator = new AppointmentDecorator(appointment)
  }

  get sessionSummaryQuestion(): { text: string; hint: string } {
    return this.appointmentDecorator.isInitialAssessmentAppointment
      ? {
          text: `What did you do in the appointment?`,
          hint: 'Add details about what you did, anything that was achieved and what came out of the appointment.',
        }
      : {
          text: `What did you do in the session?`,
          hint: 'Add details about what you did, anything that was achieved and what came out of the session.',
        }
  }

  get sessionResponseQuestion(): { text: string; hint: string } {
    return this.appointmentDecorator.isInitialAssessmentAppointment
      ? {
          text: `How did ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} respond to the appointment?`,
          hint:
            `Add whether ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} seemed engaged, ` +
            `including any progress or positive changes. This helps the probation practitioner to support them.`,
        }
      : {
          text: `How did ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} respond to the session?`,
          hint:
            `Add whether ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} seemed engaged, ` +
            `including any progress or positive changes. This helps the probation practitioner to support them.`,
        }
  }

  get futureSessionPlansQuestion(): { text: string; hint: string } {
    return {
      text: `Add anything you have planned for the next session (optional)`,
      hint: `You’ll be able to view these plans in this service, for example before you hold the next session.`,
    }
  }

  get sessionConcernsQuestion(): { text: string } {
    return {
      text: `Add enough detail to help the probation practitioner to know what happened.`,
    }
  }

  get lateReasonQuestion(): { text: string } {
    return {
      text: `Add how late they were and anything you know about the reason.`,
    }
  }

  get behaviourQuestion(): { text: string; hint: string } {
    if (this.appointmentDecorator.isInitialAssessmentAppointment) {
      return {
        text: `Describe ${this.serviceUser.name.forename}'s behaviour in the assessment appointment`,
        hint: 'For example, consider how well-engaged they were and what their body language was like.',
      }
    }
    return {
      text: `Describe ${this.serviceUser.name.forename}'s behaviour in this session`,
      hint: 'For example, consider how well-engaged they were and what their body language was like.',
    }
  }

  get notifyProbationPractitionerQuestion(): { text: string; hint: string; explanation: string } {
    return {
      text: `Do you want to notify the probation practitioner about poor behaviour?`,
      explanation: 'If you select yes, the probation practitioner will get an email about your concerns.',
      hint: 'Select one option',
    }
  }

  get lateQuestion(): { text: string; hint: string } {
    return {
      text: `Was Alex River late?`,
      hint: `This helps the probation practitioner to support Alex River.`,
    }
  }
}
