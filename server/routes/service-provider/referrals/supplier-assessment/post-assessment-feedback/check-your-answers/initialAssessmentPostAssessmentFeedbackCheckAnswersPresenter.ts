import DeliusServiceUser from '../../../../../../models/delius/deliusServiceUser'
import CheckFeedbackAnswersPresenter from '../../../../appointment/feedback/check-your-answers/checkFeedbackAnswersPresenter'
import BehaviourFeedbackPresenter from '../../../../appointment/feedback/behaviour/behaviourFeedbackPresenter'
import AttendanceFeedbackPresenter from '../../../../appointment/feedback/attendance/attendanceFeedbackPresenter'
import InitialAssessmentPostAssessmentAttendanceFeedbackPresenter from '../attendance/initialAssessmentPostAssessmentAttendanceFeedbackPresenter'
import Appointment from '../../../../../../models/appointment'

export default class InitialAssessmentPostAssessmentFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: BehaviourFeedbackPresenter

  constructor(
    appointment: Appointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string
  ) {
    super(appointment)
    this.attendancePresenter = new InitialAssessmentPostAssessmentAttendanceFeedbackPresenter(
      appointment,
      this.serviceUser
    )
    this.behaviourPresenter = new BehaviourFeedbackPresenter(appointment, this.serviceUser)
  }

  readonly submitHref = `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/submit`
}
