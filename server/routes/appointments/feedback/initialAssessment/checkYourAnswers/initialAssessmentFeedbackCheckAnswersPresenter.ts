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
    super(appointment, appointmentSummary, 'Confirm appointment feedback')
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(appointment, serviceUser, true)
  }

  readonly submitHref = this.draftId
    ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/submit`
    : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/submit`

  get backLinkHref(): string {
    if (this.appointment.appointmentFeedback.attendanceFeedback.didSessionHappen === true) {
      return this.draftId
        ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/behaviour`
        : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/behaviour`
    }
    return this.draftId
      ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/no-session`
      : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/no-session`
  }

  get attendanceFeedbackChangeLink(): string {
    return this.draftId
      ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/attendance`
      : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/attendance`
  }

  get sessionFeedbackChangeLink(): string {
    if (this.appointment.appointmentFeedback.attendanceFeedback.didSessionHappen === true) {
      return this.draftId
        ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/behaviour`
        : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/behaviour`
    }
    return this.draftId
      ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/no-session`
      : `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/no-session`
  }
}
