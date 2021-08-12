import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import DateUtils from '../../../../../utils/dateUtils'
import { SummaryListItem } from '../../../../../utils/summaryList'
import FeedbackAnswersPresenter from '../viewFeedback/feedbackAnswersPresenter'

export default abstract class CheckFeedbackAnswersPresenter {
  protected constructor(protected appointment: ActionPlanAppointment | InitialAssessmentAppointment) {}

  abstract readonly submitHref: string

  abstract readonly backLinkHref: string

  abstract readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

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
