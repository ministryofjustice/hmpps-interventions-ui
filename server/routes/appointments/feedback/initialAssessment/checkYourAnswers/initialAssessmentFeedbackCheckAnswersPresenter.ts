import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import BehaviourFeedbackPresenter from '../../shared/behaviour/behaviourFeedbackPresenter'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'
import InitialAssessmentAttendanceFeedbackPresenter from '../attendance/initialAssessmentAttendanceFeedbackPresenter'
import Appointment from '../../../../../models/appointment'

export default class InitialAssessmentFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: BehaviourFeedbackPresenter

  constructor(
    appointment: Appointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string
  ) {
    super(appointment)
    this.attendancePresenter = new InitialAssessmentAttendanceFeedbackPresenter(appointment, this.serviceUser)
    this.behaviourPresenter = new BehaviourFeedbackPresenter(appointment, this.serviceUser)
  }

  readonly submitHref = `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/submit`
}
