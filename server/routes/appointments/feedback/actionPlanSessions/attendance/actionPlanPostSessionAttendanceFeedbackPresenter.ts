import { ActionPlanAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'

export default class ActionPlanPostSessionAttendanceFeedbackPresenter extends AttendanceFeedbackPresenter {
  constructor(
    private readonly actionPlanAppointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    error: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null,
    private readonly referralId: string | null = null
  ) {
    super(actionPlanAppointment, error, userInputData)
  }

  readonly text = {
    title: `Add attendance feedback`,
    subTitle: 'Session details',
    attendanceQuestion: this.attendanceQuestion,
    attendanceQuestionHint: 'Select one option',
    additionalAttendanceInformationLabel: `Add additional information about ${this.serviceUser.firstName}'s attendance:`,
  }

  readonly backLinkHref = this.referralId ? `/service-provider/referrals/${this.referralId}/progress` : null

  private get attendanceQuestion(): string {
    switch (this.actionPlanAppointment.appointmentDeliveryType) {
      case 'PHONE_CALL':
        return `Did ${this.serviceUser.firstName} join this phone call?`
      case 'VIDEO_CALL':
        return `Did ${this.serviceUser.firstName} join this video call?`
      case 'IN_PERSON_MEETING_OTHER':
      case 'IN_PERSON_MEETING_PROBATION_OFFICE':
        return `Did ${this.serviceUser.firstName} attend this in-person meeting?`
      default:
        return `Did ${this.serviceUser.firstName} attend this session?`
    }
  }
}
