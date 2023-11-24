import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import AttendanceFeedbackQuestionnaire from '../attendance/attendanceFeedbackQuestionnaire'
import SessionFeedbackQuestionnaire from '../sessionFeedback/sessionFeedbackQuestionnaire'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { NoSessionReasonType } from '../../../../../models/sessionFeedback'

export default class FeedbackAnswersPresenter {
  private readonly attendanceFeedbackQuestionnaire: AttendanceFeedbackQuestionnaire

  private readonly behaviourFeedbackQuestionnaire: SessionFeedbackQuestionnaire

  constructor(
    private readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly isSupplierAssessmentAppointment: boolean
  ) {
    this.attendanceFeedbackQuestionnaire = new AttendanceFeedbackQuestionnaire(appointment, serviceUser)
    this.behaviourFeedbackQuestionnaire = new SessionFeedbackQuestionnaire(appointment, serviceUser)
  }

  readonly text = {
    attendanceHeading: `${this.isSupplierAssessmentAppointment ? 'Appointment' : 'Session'} attendance`,
    feedbackHeading: `${this.isSupplierAssessmentAppointment ? 'Appointment' : 'Session'} feedback`,
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
      question:
        `Did ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} attend the ` +
        `${this.isSupplierAssessmentAppointment ? 'appointment' : 'session'}?`,
      answer: selected.text,
    }
  }

  private get possibleAttendanceAnswers(): { value: string; text: string }[] {
    return [
      {
        value: 'yes',
        text: 'Yes',
      },
      {
        value: 'do_not_know',
        text: `I don't know`,
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

  get sessionHappenAnswers(): { question: string; answer: string } | null {
    if (this.appointment.appointmentFeedback.attendanceFeedback.didSessionHappen === null) {
      return null
    }

    if (this.appointment.appointmentFeedback.attendanceFeedback.didSessionHappen) {
      return {
        question: this.attendanceFeedbackQuestionnaire.sessionHappenQuestion.text,
        answer: this.appointment.appointmentFeedback.attendanceFeedback.didSessionHappen ? 'Yes' : 'No',
      }
    }
    return {
      question: this.attendanceFeedbackQuestionnaire.sessionHappenQuestion.text,
      answer: this.appointment.appointmentFeedback.attendanceFeedback.didSessionHappen ? 'Yes' : 'No',
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

  get noSessionReasonTypeAnswers(): { question: string; answerType: string; answerReasoning: string } | null {
    if (this.appointment.appointmentFeedback.sessionFeedback.noSessionReasonType === null) {
      return null
    }

    const reasonType = this.appointment.appointmentFeedback.sessionFeedback.noSessionReasonType
    let answerType
    let answerReasoning
    if (reasonType === NoSessionReasonType.POP_ACCEPTABLE) {
      answerType = `The person could not take part, for example because of illness or a crisis`
      answerReasoning = this.appointment.appointmentFeedback.sessionFeedback.noSessionReasonPopAcceptable!
    } else if (reasonType === NoSessionReasonType.POP_UNACCEPTABLE) {
      answerType = `The person did not comply, for example they were disruptive or disengaged`
      answerReasoning = this.appointment.appointmentFeedback.sessionFeedback.noSessionReasonPopUnacceptable!
    } else {
      answerType = `Something to do with the service provider or logistics, for example a room booking or fire alarm`
      answerReasoning = this.appointment.appointmentFeedback.sessionFeedback.noSessionReasonLogistics!
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.noSessionReasonQuestion.text,
      answerType,
      answerReasoning,
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

  get lateAnswers(): { question: string; answer: string } | null {
    if (this.appointment.appointmentFeedback.sessionFeedback.late == null) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.lateQuestion.text,
      answer: this.appointment.appointmentFeedback.sessionFeedback.late ? 'Yes' : 'No',
    }
  }

  get futureSessionPlans(): { question: string; answer: string } | null {
    if (!this.appointment.appointmentFeedback.sessionFeedback.futureSessionPlans) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.futureSessionPlansQuestion.text,
      answer: this.appointment.appointmentFeedback.sessionFeedback.futureSessionPlans,
    }
  }

  get noAttendanceInformationAnswers(): { question: string; answer: string } | null {
    if (this.appointment.appointmentFeedback.sessionFeedback.noAttendanceInformation === null) {
      return null
    }

    return {
      question: this.behaviourFeedbackQuestionnaire.noAttendanceInformationQuestion.text,
      answer: this.appointment.appointmentFeedback.sessionFeedback.noAttendanceInformation,
    }
  }
}
