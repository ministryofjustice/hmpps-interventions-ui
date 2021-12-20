import { ActionPlanAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import FeedbackAnswersPresenter from '../../shared/viewFeedback/feedbackAnswersPresenter'
import AppointmentSummary from '../../../appointmentSummary'

export default class ActionPlanPostSessionFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    private readonly actionPlanAppointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly actionPlanId: string,
    readonly appointmentSummary: AppointmentSummary,
    private readonly draftId: string | undefined = undefined
  ) {
    super(actionPlanAppointment, appointmentSummary)
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(actionPlanAppointment, serviceUser)
  }

  readonly submitHref = this.draftId
    ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/submit`
    : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/submit`

  get backLinkHref(): string {
    if (this.draftId) {
      return this.actionPlanAppointment.sessionFeedback.attendance.attended === 'no'
        ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/attendance`
        : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/behaviour`
    }
    return this.actionPlanAppointment.sessionFeedback.attendance.attended === 'no'
      ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/attendance`
      : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/behaviour`
  }
}
