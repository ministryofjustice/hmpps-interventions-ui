import { ActionPlanAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import FeedbackAnswersPresenter from '../../shared/viewFeedback/feedbackAnswersPresenter'

export default class ActionPlanPostSessionFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    private readonly actionPlanAppointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly actionPlanId: string
  ) {
    super(actionPlanAppointment)
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(actionPlanAppointment, serviceUser)
  }

  readonly submitHref = `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/submit`

  readonly backLinkHref =
    this.actionPlanAppointment.sessionFeedback.attendance.attended === 'no'
      ? `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/attendance`
      : `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/behaviour`
}
