import DateUtils from '../../../../../utils/dateUtils'
import { SummaryListItem } from '../../../../../utils/summaryList'
import FeedbackAnswersPresenter from '../viewFeedback/feedbackAnswersPresenter'
import { AppointmentDetails } from '../../appointmentDetails'

export default abstract class CheckFeedbackAnswersPresenter extends FeedbackAnswersPresenter {
  protected constructor(appointment: AppointmentDetails) {
    super(appointment)
  }

  abstract readonly submitHref: string

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
