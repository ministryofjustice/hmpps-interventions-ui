import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import User from '../../../../models/hmppsAuth/user'
import { ActionPlanAppointment } from '../../../../models/actionPlan'
import DateUtils from '../../../../utils/dateUtils'
import { SummaryListItem } from '../../../../utils/summaryList'
import FeedbackAnswersPresenter from '../../../appointments/feedback/shared/viewFeedback/feedbackAnswersPresenter'
import AttendanceFeedbackPresenter from '../../../appointments/feedback/shared/attendance/attendanceFeedbackPresenter'
import BehaviourFeedbackPresenter from '../../../appointments/feedback/shared/behaviour/behaviourFeedbackPresenter'
import ActionPlanPostSessionAttendanceFeedbackPresenter from '../../../appointments/feedback/actionPlanSessions/attendance/actionPlanPostSessionAttendanceFeedbackPresenter'
import Appointment from '../../../../models/appointment'
import InitialAssessmentAttendanceFeedbackPresenter from '../../../appointments/feedback/initialAssessment/attendance/initialAssessmentAttendanceFeedbackPresenter'

export default class SubmittedFeedbackPresenter extends FeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: BehaviourFeedbackPresenter

  constructor(
    appointmentDetails: ActionPlanAppointment | Appointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly assignedCaseworker: User | null = null
  ) {
    super(appointmentDetails)
    if (this.isActionPlanAppointment(appointmentDetails)) {
      this.attendancePresenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
        appointmentDetails,
        this.serviceUser
      )
    } else {
      this.attendancePresenter = new InitialAssessmentAttendanceFeedbackPresenter(appointmentDetails, this.serviceUser)
    }
    this.behaviourPresenter = new BehaviourFeedbackPresenter(appointmentDetails, this.serviceUser)
  }

  private isActionPlanAppointment(
    appointmentDetails: Appointment | ActionPlanAppointment
  ): appointmentDetails is ActionPlanAppointment {
    return (<ActionPlanAppointment>appointmentDetails).sessionNumber !== undefined
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
