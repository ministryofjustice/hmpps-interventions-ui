import { DeliusServiceUser } from '../../services/communityApiService'
import { ActionPlanAppointment } from '../../services/interventionsService'
import DateUtils from '../../utils/dateUtils'
import { SummaryListItem } from '../../utils/summaryList'
import FeedbackAnswersPresenter from './feedbackAnswersPresenter'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'

export default class SubmittedPostSessionFeedbackPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(private readonly appointment: ActionPlanAppointment, private readonly serviceUser: DeliusServiceUser) {
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(this.appointment, this.serviceUser)
  }

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly text = {
    title: `View feedback`,
  }

  readonly sessionDetailsSummary: SummaryListItem[] = [
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
}
