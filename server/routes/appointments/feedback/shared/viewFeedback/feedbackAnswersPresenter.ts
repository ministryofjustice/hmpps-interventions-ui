import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import AttendanceFeedbackQuestionnaire from '../attendance/attendanceFeedbackQuestionnaire'
import SessionFeedbackQuestionnaire from '../sessionFeedback/sessionFeedbackQuestionnaire'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'

export default class FeedbackAnswersPresenter {
  private readonly attendanceFeedbackQuestionnaire: AttendanceFeedbackQuestionnaire

  private readonly behaviourFeedbackQuestionnaire: SessionFeedbackQuestionnaire

  constructor(
    private readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser
  ) {
    this.attendanceFeedbackQuestionnaire = new AttendanceFeedbackQuestionnaire(appointment, serviceUser)
    this.behaviourFeedbackQuestionnaire = new SessionFeedbackQuestionnaire(appointment, serviceUser)
  }

  get attendedAnswers(): { question: string; answer: string } | null {
    if (this.appointment.appointmentFeedback.attendanceFeedback.attended === null) {
      return null
    }
    const selected = this.possibleAttendanceAnswers.find(
      selection => selection.value === this.appointment.appointmentFeedback.attendanceFeedback.attended
    )
    if (!selected) {
      return null
    }
    return {
      question: `Did ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} come to the session?`,
      answer: selected.text,
    }
  }

  private get possibleAttendanceAnswers(): { value: string; text: string }[] {
    return [
      {
        value: 'yes',
        text: 'Yes, they were on time',
      },
      {
        value: 'late',
        text: 'They were late',
      },
      {
        value: 'no',
        text: 'No',
      },
    ]
  }

  get additionalAttendanceAnswers(): { question: string; answer: string } | null {
    if (!this.appointment.appointmentFeedback.attendanceFeedback.additionalAttendanceInformation) {
      return null
    }

    return {
      question: this.attendanceFeedbackQuestionnaire.additionalAttendanceInformationQuestion,
      answer: this.appointment.appointmentFeedback.attendanceFeedback.additionalAttendanceInformation || 'None',
    }
  }

  get attendanceFailureInformationAnswers(): { question: string; answer: string } | null {
    if (!this.appointment.appointmentFeedback.attendanceFeedback.attendanceFailureInformation) {
      return null
    }

    return {
      question: this.attendanceFeedbackQuestionnaire.attendanceFailureInformationQuestion,
      answer: this.appointment.appointmentFeedback.attendanceFeedback.attendanceFailureInformation || 'None',
    }
  }

  get behaviourDescriptionAnswers(): { question: string; answer: string } | null {
    if (!this.appointment.appointmentFeedback.sessionFeedback.behaviourDescription) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.behaviourQuestion.text,
      answer: this.appointment.appointmentFeedback.sessionFeedback.behaviourDescription,
    }
  }

  get notifyProbationPractitionerAnswers(): { question: string; answer: string } | null {
    if (this.appointment.appointmentFeedback.sessionFeedback.notifyProbationPractitioner === null) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.notifyProbationPractitionerQuestion.text,
      answer: this.appointment.appointmentFeedback.sessionFeedback.notifyProbationPractitioner ? 'Yes' : 'No',
    }
  }

  get sessionSummaryAnswers(): { question: string; answer: string } | null {
    if (this.appointment.appointmentFeedback.sessionFeedback.sessionSummary === null) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.sessionSummaryQuestion.text,
      answer: this.appointment.appointmentFeedback.sessionFeedback.sessionSummary || 'None',
    }
  }

  get sessionResponseAnswers(): { question: string; answer: string } | null {
    if (this.appointment.appointmentFeedback.sessionFeedback.sessionResponse === null) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.sessionResponseQuestion.text,
      answer: this.appointment.appointmentFeedback.sessionFeedback.sessionResponse || 'None',
    }
  }

  get sessionConcernsAnswers(): { question: string; answer: string } | null {
    const notifyPP = this.appointment.appointmentFeedback.sessionFeedback.notifyProbationPractitioner ? 'Yes' : 'No'

    if (notifyPP === 'Yes' && this.appointment.appointmentFeedback.sessionFeedback.sessionConcerns) {
      return {
        question: this.behaviourFeedbackQuestionnaire.notifyProbationPractitionerQuestion.text,
        answer: `${notifyPP} - ${this.appointment.appointmentFeedback.sessionFeedback.sessionConcerns}`,
      }
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.notifyProbationPractitionerQuestion.text,
      answer: `${notifyPP}`,
    }
  }
}
