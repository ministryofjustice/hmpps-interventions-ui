import { DeliusServiceUser } from '../../services/communityApiService'
import { ActionPlanAppointment } from '../../services/interventionsService'
import DateUtils from '../../utils/dateUtils'
import { SummaryListItem } from '../../utils/summaryList'
import FeedbackAnswersPresenter from '../shared/feedbackAnswersPresenter'
import ServiceUserBannerPresenter from '../shared/serviceUserBannerPresenter'

export default class PostSessionFeedbackCheckAnswersPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly actionPlanId: string
  ) {
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(this.appointment, this.serviceUser)
  }

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly submitHref = `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.appointment.sessionNumber}/post-session-feedback/submit`

  readonly text = {
    title: `Confirm feedback`,
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
