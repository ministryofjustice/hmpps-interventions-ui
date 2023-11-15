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
    super(actionPlanAppointment, appointmentSummary, 'Confirm session feedback')
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(actionPlanAppointment, serviceUser, false)
  }

  readonly submitHref = this.draftId
    ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/submit`
    : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/submit`

  get backLinkHref(): string {
    if (this.actionPlanAppointment.appointmentFeedback.attendanceFeedback.didSessionHappen === true) {
      return this.draftId
        ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/behaviour`
        : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/behaviour`
    }
    return this.draftId
      ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/no-session`
      : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/no-session`
  }

  get attendanceFeedbackChangeLink(): string {
    return this.draftId
      ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/attendance`
      : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/attendance`
  }

  get sessionFeedbackChangeLink(): string {
    if (this.actionPlanAppointment.appointmentFeedback.attendanceFeedback.didSessionHappen === true) {
      return this.draftId
        ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/behaviour`
        : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/behaviour`
    }
    return this.draftId
      ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/no-session`
      : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/no-session`
  }
}
