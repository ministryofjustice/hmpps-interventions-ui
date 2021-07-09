import DeliusServiceUser from '../../../../../../models/delius/deliusServiceUser'
import { ActionPlanAppointment } from '../../../../../../models/actionPlan'
import CheckFeedbackAnswersPresenter from '../../../../appointment/feedback/check-your-answers/checkFeedbackAnswersPresenter'
import ActionPlanPostSessionAttendanceFeedbackPresenter from '../attendance/actionPlanPostSessionAttendanceFeedbackPresenter'
import BehaviourFeedbackPresenter from '../../../../appointment/feedback/behaviour/behaviourFeedbackPresenter'
import AttendanceFeedbackPresenter from '../../../../appointment/feedback/attendance/attendanceFeedbackPresenter'

export default class ActionPlanPostSessionFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: BehaviourFeedbackPresenter

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
    this.behaviourPresenter = new BehaviourFeedbackPresenter(this.actionPlanAppointment, this.serviceUser)
  }

  readonly submitHref = `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.actionPlanAppointment.sessionNumber}/post-session-feedback/submit`
}
