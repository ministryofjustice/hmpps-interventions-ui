import DeliusServiceUser from '../../../../../../models/delius/deliusServiceUser'
import { ActionPlanAppointment } from '../../../../../../models/actionPlan'
import DateUtils from '../../../../../../utils/dateUtils'
import { SummaryListItem } from '../../../../../../utils/summaryList'
import FeedbackAnswersPresenter from '../../../../../shared/action-plan/appointment/post-session-feedback/feedbackAnswersPresenter'

export default class PostSessionFeedbackCheckAnswersPresenter {
  readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly actionPlanId: string
  ) {
    this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(this.appointment, this.serviceUser)
  }

  readonly submitHref = `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.appointment.sessionNumber}/post-session-feedback/submit`

  readonly text = {
    title: `Confirm feedback`,
  }

  readonly sessionDetailsSummary: SummaryListItem[] = [
    {
      key: 'Date',
      lines: [DateUtils.getDateStringFromDateTimeString(this.appointment.appointmentTime)],
    },
    {
      key: 'Time',
      lines: [DateUtils.getTimeStringFromDateTimeString(this.appointment.appointmentTime)],
    },
  ]
}
