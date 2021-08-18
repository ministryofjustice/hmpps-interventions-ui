import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import FeedbackAnswersPresenter from '../../../appointments/feedback/shared/viewFeedback/feedbackAnswersPresenter'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../models/appointment'
import AppointmentSummary from '../../../appointments/appointmentSummary'

export default class SubmittedFeedbackPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    protected readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    readonly appointmentSummary: AppointmentSummary,
    private readonly serviceUser: DeliusServiceUser,
    private readonly userType: 'probation-practitioner' | 'service-provider',
    private readonly referralId: string,
    private readonly actionPlanId: string | null = null
  ) {
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(appointment, serviceUser)
  }

  readonly backLinkHref = `/${this.userType}/referrals/${this.referralId}/progress`

  readonly text = {
    title: `View feedback`,
  }
}
