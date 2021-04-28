import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import AuthUser from '../../models/authUser'
import { ActionPlanAppointment } from '../../models/actionPlan'
import DateUtils from '../../utils/dateUtils'
import { SummaryListItem } from '../../utils/summaryList'
import FeedbackAnswersPresenter from './feedbackAnswersPresenter'

export default class SubmittedPostSessionFeedbackPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly assignedCaseworker: AuthUser | null = null
  ) {
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(this.appointment, this.serviceUser)
  }

  readonly text = {
    title: `View feedback`,
  }

  get sessionDetailsSummary(): SummaryListItem[] {
    const dateAndTimeSummary = [
      {
        key: 'Date',
        lines: [DateUtils.getDateStringFromDateTimeString(this.appointment.appointmentTime)],
        isList: false,
      },
      {
        key: 'Time',
        lines: [DateUtils.getTimeStringFromDateTimeString(this.appointment.appointmentTime)],
        isList: false,
      },
    ]

    if (this.assignedCaseworker) {
      return [
        {
          key: 'Caseworker',
          lines: [this.assignedCaseworker.username],
          isList: false,
        },
        ...dateAndTimeSummary,
      ]
    }

    return dateAndTimeSummary
  }
}
