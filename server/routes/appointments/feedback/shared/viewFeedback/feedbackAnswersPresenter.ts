import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import AttendanceFeedbackQuestionnaire from '../attendance/attendanceFeedbackQuestionnaire'
import BehaviourFeedbackQuestionnaire from '../behaviour/behaviourFeedbackQuestionnaire'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'

export default class FeedbackAnswersPresenter {
  private readonly attendanceFeedbackQuestionnaire: AttendanceFeedbackQuestionnaire

  private readonly behaviourFeedbackQuestionnaire: BehaviourFeedbackQuestionnaire

  constructor(
    private readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser
  ) {
    this.attendanceFeedbackQuestionnaire = new AttendanceFeedbackQuestionnaire(appointment, serviceUser)
    this.behaviourFeedbackQuestionnaire = new BehaviourFeedbackQuestionnaire(appointment, serviceUser)
  }

  get attendedAnswers(): { question: string; answer: string } | null {
    if (this.appointment.sessionFeedback.attendance.attended === null) {
      return null
    }
    const selected = this.possibleAttendanceAnswers.find(
      selection => selection.value === this.appointment.sessionFeedback.attendance.attended
    )
    if (!selected) {
      return null
    }
    return {
      question: this.attendanceFeedbackQuestionnaire.attendanceQuestion.text,
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
    if (this.appointment.sessionFeedback.attendance.additionalAttendanceInformation === null) {
      return null
    }

    return {
      question: this.attendanceFeedbackQuestionnaire.additionalAttendanceInformationQuestion,
      answer: this.appointment.sessionFeedback.attendance.additionalAttendanceInformation || 'None',
    }
  }

  get behaviourDescriptionAnswers(): { question: string; answer: string } | null {
    if (this.appointment.sessionFeedback.behaviour.behaviourDescription === null) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.behaviourQuestion.text,
      answer: this.appointment.sessionFeedback.behaviour.behaviourDescription,
    }
  }

  get notifyProbationPractitionerAnswers(): { question: string; answer: string } | null {
    if (this.appointment.sessionFeedback.behaviour.notifyProbationPractitioner === null) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.notifyProbationPractitionerQuestion.text,
      answer: this.appointment.sessionFeedback.behaviour.notifyProbationPractitioner ? 'Yes' : 'No',
    }
  }
}
