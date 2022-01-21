import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import CheckFeedbackAnswersPresenter from '../../shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import FeedbackAnswersPresenter from '../../shared/viewFeedback/feedbackAnswersPresenter'
import AppointmentSummary from '../../../appointmentSummary'

export default class InitialAssessmentFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    appointment: InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string,
    readonly appointmentSummary: AppointmentSummary,
    private readonly draftId: string | undefined = undefined
  ) {
    super(appointment, appointmentSummary)
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(appointment, serviceUser)
  }

  readonly submitHref = this.draftId
    ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/submit`
    : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/submit`

  get backLinkHref(): string {
    if (this.draftId) {
      return this.appointment.sessionFeedback.attendance.attended === 'no'
        ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/attendance`
        : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/behaviour`
    }
    return this.appointment.sessionFeedback.attendance.attended === 'no'
      ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/attendance`
      : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/behaviour`
  }
}
