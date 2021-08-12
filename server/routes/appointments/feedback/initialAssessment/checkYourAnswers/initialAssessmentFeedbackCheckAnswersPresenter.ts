import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import FeedbackAnswersPresenter from '../../shared/viewFeedback/feedbackAnswersPresenter'

export default class InitialAssessmentFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    appointment: InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string
  ) {
    super(appointment)
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(appointment, serviceUser)
  }

  readonly submitHref = `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/submit`

  readonly backLinkHref =
    this.appointment.sessionFeedback.attendance.attended === 'no'
      ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/attendance`
      : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/behaviour`
}
