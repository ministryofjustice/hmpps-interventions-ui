import { ActionPlanAppointment } from '../../../../../models/actionPlan'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'
import BehaviourFeedbackPresenter from '../../shared/behaviour/behaviourFeedbackPresenter'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import ActionPlanPostSessionAttendanceFeedbackPresenter from '../attendance/actionPlanPostSessionAttendanceFeedbackPresenter'

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
