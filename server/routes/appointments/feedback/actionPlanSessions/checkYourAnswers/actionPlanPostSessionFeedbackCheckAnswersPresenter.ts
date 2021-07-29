import { ActionPlanAppointment } from '../../../../../models/actionPlan'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import ActionPlanPostSessionAttendanceFeedbackPresenter from '../attendance/actionPlanPostSessionAttendanceFeedbackPresenter'
import ActionPlanSessionBehaviourFeedbackPresenter from '../behaviour/actionPlanSessionBehaviourFeedbackPresenter'

export default class ActionPlanPostSessionFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: ActionPlanSessionBehaviourFeedbackPresenter

  constructor(
    private readonly actionPlanAppointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly actionPlanId: string
  ) {
    super(actionPlanAppointment)
    this.attendancePresenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
      this.actionPlanAppointment,
      this.serviceUser
    )
    this.behaviourPresenter = new ActionPlanSessionBehaviourFeedbackPresenter(
      this.actionPlanAppointment,
      this.serviceUser,
      this.actionPlanId
    )
  }

  readonly submitHref = `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/submit`
}
