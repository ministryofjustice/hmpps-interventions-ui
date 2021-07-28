import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'
import InitialAssessmentAttendanceFeedbackPresenter from '../attendance/initialAssessmentAttendanceFeedbackPresenter'
import Appointment from '../../../../../models/appointment'
import InitialAssessmentBehaviourFeedbackPresenter from '../behaviour/initialAssessmentBehaviourFeedbackPresenter'

export default class InitialAssessmentFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: InitialAssessmentBehaviourFeedbackPresenter

  constructor(
    appointment: Appointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string
  ) {
    super(appointment)
    this.attendancePresenter = new InitialAssessmentAttendanceFeedbackPresenter(appointment, this.serviceUser)
    this.behaviourPresenter = new InitialAssessmentBehaviourFeedbackPresenter(appointment, this.serviceUser)
  }

  readonly submitHref = `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/submit`
}
