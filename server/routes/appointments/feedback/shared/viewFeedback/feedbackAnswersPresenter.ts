import AttendanceFeedbackPresenter from '../attendance/attendanceFeedbackPresenter'
import BehaviourFeedbackPresenter from '../behaviour/behaviourFeedbackPresenter'
import { AppointmentDetails } from '../../appointmentDetails'

export default abstract class FeedbackAnswersPresenter {
  protected abstract get attendancePresenter(): AttendanceFeedbackPresenter

  protected abstract get behaviourPresenter(): BehaviourFeedbackPresenter

  protected constructor(protected readonly appointment: AppointmentDetails) {}

  get attendedAnswers(): { question: string; answer: string } | null {
    if (this.appointment.sessionFeedback.attendance.attended === null) {
      return null
    }

    const selectedRadio = this.attendancePresenter.attendanceResponses.find(response => response.checked)

    if (!selectedRadio) {
      return null
    }

    return {
      question: this.attendancePresenter.text.attendanceQuestion,
      answer: selectedRadio.text,
    }
  }

  get additionalAttendanceAnswers(): { question: string; answer: string } | null {
    if (this.appointment.sessionFeedback.attendance.additionalAttendanceInformation === null) {
      return null
    }

    return {
      question: this.attendancePresenter.text.additionalAttendanceInformationLabel,
      answer: this.appointment.sessionFeedback.attendance.additionalAttendanceInformation || 'None',
    }
  }

  get behaviourDescriptionAnswers(): { question: string; answer: string } | null {
    if (this.appointment.sessionFeedback.behaviour.behaviourDescription === null) {
      return null
    }

    return {
      question: this.behaviourPresenter.text.behaviourDescription.question,
      answer: this.appointment.sessionFeedback.behaviour.behaviourDescription,
    }
  }

  get notifyProbationPractitionerAnswers(): { question: string; answer: string } | null {
    if (this.appointment.sessionFeedback.behaviour.notifyProbationPractitioner === null) {
      return null
    }

    return {
      question: this.behaviourPresenter.text.notifyProbationPractitioner.question,
      answer: this.appointment.sessionFeedback.behaviour.notifyProbationPractitioner ? 'Yes' : 'No',
    }
  }
}
