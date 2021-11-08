import { ActionPlanAppointment } from '../../../../models/appointment'
import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import AppointmentSummary from '../../appointmentSummary'
import CheckFeedbackAnswersPresenter from '../../feedback/shared/checkYourAnswers/checkFeedbackAnswersPresenter'
import FeedbackAnswersPresenter from '../../feedback/shared/viewFeedback/feedbackAnswersPresenter'

export default class DeliverySessionFeedbackCheckAnswersPresenter extends CheckFeedbackAnswersPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    private readonly deliverySessionAppointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string,
    readonly appointmentSummary: AppointmentSummary
  ) {
    super(deliverySessionAppointment, appointmentSummary)
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(deliverySessionAppointment, serviceUser)
  }

  readonly submitHref = `/service-provider/referral/${this.referralId}/session/${this.deliverySessionAppointment.sessionNumber}/appointment/${this.deliverySessionAppointment.id}/feedback/submit`

  readonly backLinkHref =
    this.deliverySessionAppointment.sessionFeedback.attendance.attended === 'no'
      ? `/service-provider/referral/${this.referralId}/session/${this.deliverySessionAppointment.sessionNumber}/appointment/${this.deliverySessionAppointment.id}/feedback/attendance`
      : `/service-provider/referral/${this.referralId}/session/${this.deliverySessionAppointment.sessionNumber}/appointment/${this.deliverySessionAppointment.id}/feedback/behaviour`
}
