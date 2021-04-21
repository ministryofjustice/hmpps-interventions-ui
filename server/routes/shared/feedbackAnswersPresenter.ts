import { DeliusServiceUser } from '../../services/communityApiService'
import { ActionPlanAppointment } from '../../services/interventionsService'
import PostSessionAttendanceFeedbackPresenter from '../serviceProviderReferrals/postSessionAttendanceFeedbackPresenter'
import PostSessionBehaviourFeedbackPresenter from '../serviceProviderReferrals/postSessionBehaviourFeedbackPresenter'

export default class FeedbackAnswersPresenter {
  private readonly attendancePresenter: PostSessionAttendanceFeedbackPresenter

  private readonly behaviourPresenter: PostSessionBehaviourFeedbackPresenter

  constructor(private readonly appointment: ActionPlanAppointment, private readonly serviceUser: DeliusServiceUser) {
    this.attendancePresenter = new PostSessionAttendanceFeedbackPresenter(this.appointment, this.serviceUser)
    this.behaviourPresenter = new PostSessionBehaviourFeedbackPresenter(this.appointment, this.serviceUser)
  }

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
