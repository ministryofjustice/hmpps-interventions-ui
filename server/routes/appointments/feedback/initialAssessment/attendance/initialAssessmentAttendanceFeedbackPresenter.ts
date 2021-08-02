import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'

export default class InitialAssessmentAttendanceFeedbackPresenter extends AttendanceFeedbackPresenter {
  constructor(
    private readonly initialAssessmentAppointment: InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    error: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null,
    private readonly referralId: string | null = null
  ) {
    super(initialAssessmentAppointment, error, userInputData)
  }

  readonly backLinkHref = this.referralId ? `/service-provider/referrals/${this.referralId}/progress` : null

  readonly text = {
    title: `Add feedback`,
    subTitle: 'Appointment details',
    attendanceQuestion: `Did ${this.serviceUser.firstName} attend the initial assessment appointment?`,
    attendanceQuestionHint: 'Select one option',
    additionalAttendanceInformationLabel: `Add additional information about ${this.serviceUser.firstName}'s attendance:`,
  }
}
