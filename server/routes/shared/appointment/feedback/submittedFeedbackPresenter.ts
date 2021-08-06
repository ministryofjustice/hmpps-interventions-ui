import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import User from '../../../../models/hmppsAuth/user'
import DateUtils from '../../../../utils/dateUtils'
import { SummaryListItem } from '../../../../utils/summaryList'
import FeedbackAnswersPresenter from '../../../appointments/feedback/shared/viewFeedback/feedbackAnswersPresenter'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../models/appointment'

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

  get sessionDetailsSummary(): SummaryListItem[] {
    const dateAndTimeSummary = [
      {
        key: 'Date',
        lines: [DateUtils.getDateStringFromDateTimeString(this.appointment.appointmentTime)],
      },
      {
        key: 'Time',
        lines: [DateUtils.getTimeStringFromDateTimeString(this.appointment.appointmentTime)],
      },
    ]

    if (this.assignedCaseworker) {
      return [
        {
          key: 'Caseworker',
          lines: [this.assignedCaseworker.username],
        },
        ...dateAndTimeSummary,
      ]
    }

    return dateAndTimeSummary
  }
}
