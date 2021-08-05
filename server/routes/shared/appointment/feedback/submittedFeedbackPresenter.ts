import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import User from '../../../../models/hmppsAuth/user'
import DateUtils from '../../../../utils/dateUtils'
import { SummaryListItem } from '../../../../utils/summaryList'
import FeedbackAnswersPresenter from '../../../appointments/feedback/shared/viewFeedback/feedbackAnswersPresenter'
import AttendanceFeedbackPresenter from '../../../appointments/feedback/shared/attendance/attendanceFeedbackPresenter'
import ActionPlanPostSessionAttendanceFeedbackPresenter from '../../../appointments/feedback/actionPlanSessions/attendance/actionPlanPostSessionAttendanceFeedbackPresenter'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../models/appointment'
import InitialAssessmentAttendanceFeedbackPresenter from '../../../appointments/feedback/initialAssessment/attendance/initialAssessmentAttendanceFeedbackPresenter'
import ActionPlanSessionBehaviourFeedbackPresenter from '../../../appointments/feedback/actionPlanSessions/behaviour/actionPlanSessionBehaviourFeedbackPresenter'
import InitialAssessmentBehaviourFeedbackPresenter from '../../../appointments/feedback/initialAssessment/behaviour/initialAssessmentBehaviourFeedbackPresenter'
import { BehaviourFeedbackPresenter } from '../../../appointments/feedback/shared/behaviour/behaviourFeedbackPresenter'

export default class SubmittedFeedbackPresenter extends FeedbackAnswersPresenter {
  protected readonly attendancePresenter: AttendanceFeedbackPresenter

  protected readonly behaviourPresenter: BehaviourFeedbackPresenter

  constructor(
    protected readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly userType: 'probation-practitioner' | 'service-provider',
    private readonly referralId: string,
    private readonly actionPlanId: string | null = null,
    private readonly assignedCaseworker: User | null = null
  ) {
    super(appointment)

    if (this.isActionPlanAppointment(appointment)) {
      this.attendancePresenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(appointment, this.serviceUser)
      this.behaviourPresenter = new ActionPlanSessionBehaviourFeedbackPresenter(
        appointment,
        this.serviceUser,
        this.actionPlanId
      )
    } else {
      this.attendancePresenter = new InitialAssessmentAttendanceFeedbackPresenter(appointment, this.serviceUser)
      this.behaviourPresenter = new InitialAssessmentBehaviourFeedbackPresenter(appointment, this.serviceUser)
    }
  }

  readonly backLinkHref = `/${this.userType}/referrals/${this.referralId}/progress`

  private isActionPlanAppointment(
    appointment: InitialAssessmentAppointment | ActionPlanAppointment
  ): appointment is ActionPlanAppointment {
    return (<ActionPlanAppointment>appointment).sessionNumber !== undefined
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
