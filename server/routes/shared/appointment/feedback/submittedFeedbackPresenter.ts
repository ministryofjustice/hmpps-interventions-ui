import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import User from '../../../../models/hmppsAuth/user'
import FeedbackAnswersPresenter from '../../../appointments/feedback/shared/viewFeedback/feedbackAnswersPresenter'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../models/appointment'
import AppointmentSummary from '../../../appointments/appointmentSummary'

export default class SubmittedFeedbackPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    protected readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly userType: 'probation-practitioner' | 'service-provider',
    private readonly referralId: string,
    private readonly actionPlanId: string | null = null,
    private readonly assignedCaseworker: User | null = null
  ) {
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(appointment, serviceUser)
  }

  readonly backLinkHref = `/${this.userType}/referrals/${this.referralId}/progress`

  readonly text = {
    title: `View feedback`,
  }

  readonly appointmentSummary = new AppointmentSummary(this.appointment, this.assignedCaseworker)
}
