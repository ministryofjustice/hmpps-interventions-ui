import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import FeedbackAnswersPresenter from '../viewFeedback/feedbackAnswersPresenter'
import AppointmentSummary from '../../../appointmentSummary'

export default abstract class CheckFeedbackAnswersPresenter {
  protected constructor(
    protected appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    readonly appointmentSummary: AppointmentSummary
  ) {}

  abstract readonly submitHref: string

  abstract readonly backLinkHref: string

  abstract readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  readonly text = {
    title: `Confirm feedback`,
  }
}
