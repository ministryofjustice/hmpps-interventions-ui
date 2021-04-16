import { DeliusServiceUser } from '../../../services/communityApiService'
import { ActionPlanAppointment } from '../../../services/interventionsService'
import { SummaryListItem } from '../../../utils/summaryList'
import ServiceUserBannerPresenter from '../../shared/serviceUserBannerPresenter'
import PostSessionAttendanceFeedbackPresenter from './postSessionAttendanceFeedbackPresenter'
import PostSessionBehaviourFeedbackPresenter from './postSessionBehaviourFeedbackPresenter'

export default class PostSessionFeedbackCheckAnswersPresenter {
  private readonly attendancePresenter: PostSessionAttendanceFeedbackPresenter

  private readonly behaviourPresenter: PostSessionBehaviourFeedbackPresenter

  constructor(private readonly appointment: ActionPlanAppointment, private readonly serviceUser: DeliusServiceUser) {
    this.attendancePresenter = new PostSessionAttendanceFeedbackPresenter(appointment, serviceUser)
    this.behaviourPresenter = new PostSessionBehaviourFeedbackPresenter(this.appointment, this.serviceUser)
  }

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly text = {
    title: `Confirm feedback`,
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

  get sessionDetailsSummary(): SummaryListItem[] {
    return this.attendancePresenter.sessionDetailsSummary
  }
}
