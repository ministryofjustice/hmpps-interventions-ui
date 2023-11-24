import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import FeedbackAnswersPresenter from '../viewFeedback/feedbackAnswersPresenter'
import AppointmentSummary from '../../../appointmentSummary'
import { SummaryListItem } from '../../../../../utils/summaryList'

export default abstract class CheckFeedbackAnswersPresenter {
  protected constructor(
    protected appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    readonly appointmentSummary: AppointmentSummary,
    readonly title: string
  ) {}

  abstract readonly submitHref: string

  abstract readonly backLinkHref: string

  abstract readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  abstract readonly attendanceFeedbackChangeLink: string

  abstract readonly sessionFeedbackChangeLink: string

  readonly sessionDetailsHeading = `Session details`

  readonly sessionAttendanceHeading = `Session attendance`

  readonly sessionFeedbackHeading = `Session feedback`

  readonly text = {
    title: this.title,
  }

  get sessionAttendanceSummaryListArgs(): SummaryListItem[] {
    const sessionAttendanceDetails: SummaryListItem[] = []
    if (this.feedbackAnswersPresenter.sessionHappenAnswers) {
      sessionAttendanceDetails.push({
        key: this.feedbackAnswersPresenter.sessionHappenAnswers.question,
        lines: [this.feedbackAnswersPresenter.sessionHappenAnswers.answer],
      })
    }
    if (this.feedbackAnswersPresenter.attendedAnswers) {
      sessionAttendanceDetails.push({
        key: this.feedbackAnswersPresenter.attendedAnswers.question,
        lines: [this.feedbackAnswersPresenter.attendedAnswers.answer],
      })
    }
    if (this.feedbackAnswersPresenter.additionalAttendanceAnswers) {
      sessionAttendanceDetails.push({
        key: this.feedbackAnswersPresenter.additionalAttendanceAnswers.question,
        lines: [this.feedbackAnswersPresenter.additionalAttendanceAnswers.answer],
      })
    }
    return sessionAttendanceDetails
  }

  get sessionFeedbackSummaryListArgs(): SummaryListItem[] {
    const sessionFeedbackDetails: SummaryListItem[] = []
    if (this.feedbackAnswersPresenter.lateAnswers) {
      sessionFeedbackDetails.push({
        key: this.feedbackAnswersPresenter.lateAnswers.question,
        lines: [this.feedbackAnswersPresenter.lateAnswers.answer],
      })
    }
    if (this.feedbackAnswersPresenter.sessionSummaryAnswers) {
      sessionFeedbackDetails.push({
        key: this.feedbackAnswersPresenter.sessionSummaryAnswers.question,
        lines: [this.feedbackAnswersPresenter.sessionSummaryAnswers.answer],
      })
    }
    if (this.feedbackAnswersPresenter.sessionResponseAnswers) {
      sessionFeedbackDetails.push({
        key: this.feedbackAnswersPresenter.sessionResponseAnswers.question,
        lines: [this.feedbackAnswersPresenter.sessionResponseAnswers.answer],
      })
    }
    if (this.feedbackAnswersPresenter.noSessionReasonTypeAnswers) {
      sessionFeedbackDetails.push({
        key: this.feedbackAnswersPresenter.noSessionReasonTypeAnswers.question,
        lines: [
          this.feedbackAnswersPresenter.noSessionReasonTypeAnswers.answerType,
          this.feedbackAnswersPresenter.noSessionReasonTypeAnswers.answerReasoning,
        ],
      })
    }
    if (this.feedbackAnswersPresenter.noAttendanceInformationAnswers) {
      sessionFeedbackDetails.push({
        key: this.feedbackAnswersPresenter.noAttendanceInformationAnswers.question,
        lines: [this.feedbackAnswersPresenter.noAttendanceInformationAnswers.answer],
      })
    }
    // if (this.feedbackAnswersPresenter.notifyProbationPractitionerAnswers) {
    //   sessionFeedbackDetails.push({
    //     key: this.feedbackAnswersPresenter.notifyProbationPractitionerAnswers.question,
    //     lines: [this.feedbackAnswersPresenter.notifyProbationPractitionerAnswers.answer],
    //   })
    // }
    if (this.feedbackAnswersPresenter.sessionConcernsAnswers) {
      sessionFeedbackDetails.push({
        key: this.feedbackAnswersPresenter.sessionConcernsAnswers.question,
        lines: [this.feedbackAnswersPresenter.sessionConcernsAnswers.answer],
      })
    }
    if (this.feedbackAnswersPresenter.behaviourDescriptionAnswers) {
      sessionFeedbackDetails.push({
        key: this.feedbackAnswersPresenter.behaviourDescriptionAnswers.question,
        lines: [this.feedbackAnswersPresenter.behaviourDescriptionAnswers.answer],
      })
    }
    // if (this.feedbackAnswersPresenter.futureSessionPlans) {
    //   sessionFeedbackDetails.push({
    //     key: this.feedbackAnswersPresenter.futureSessionPlans.question,
    //     lines: [this.feedbackAnswersPresenter.futureSessionPlans.answer],
    //   })
    // }
    return sessionFeedbackDetails
  }
}
