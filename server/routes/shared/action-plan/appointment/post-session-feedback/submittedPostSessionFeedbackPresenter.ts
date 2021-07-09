import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import User from '../../../../../models/hmppsAuth/user'
import { ActionPlanAppointment } from '../../../../../models/actionPlan'
import DateUtils from '../../../../../utils/dateUtils'
import { SummaryListItem } from '../../../../../utils/summaryList'
import FeedbackAnswersPresenter from '../../../../service-provider/appointment/feedback/feedbackAnswersPresenter'
import AttendanceFeedbackPresenter from '../../../../service-provider/appointment/feedback/attendance/attendanceFeedbackPresenter'
import BehaviourFeedbackPresenter from '../../../../service-provider/appointment/feedback/behaviour/behaviourFeedbackPresenter'
import ActionPlanPostSessionAttendanceFeedbackPresenter from '../../../../service-provider/action-plan/appointment/post-session-feedback/attendance/actionPlanPostSessionAttendanceFeedbackPresenter'

export default class SubmittedPostSessionFeedbackPresenter extends FeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: BehaviourFeedbackPresenter

  constructor(
    appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly assignedCaseworker: User | null = null
  ) {
    super(appointment)
    this.attendancePresenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(appointment, this.serviceUser)
    this.behaviourPresenter = new BehaviourFeedbackPresenter(appointment, this.serviceUser)
  }

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
