import Appointment from '../../../../../../models/appointment'
import DeliusServiceUser from '../../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../../utils/formValidationError'
import AttendanceFeedbackPresenter from '../../../../appointment/feedback/attendance/attendanceFeedbackPresenter'

export default class InitialAssessmentAttendanceFeedbackPresenter extends AttendanceFeedbackPresenter {
  constructor(
    private readonly appointment: Appointment,
    private readonly serviceUser: DeliusServiceUser,
    error: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null
  ) {
    super(appointment, error, userInputData)
  }

  readonly text = {
    title: `Add feedback`,
    subTitle: 'Appointment details',
    attendanceQuestion: `Did ${this.serviceUser.firstName} attend the initial assessment appointment?`,
    attendanceQuestionHint: 'Select one option',
    additionalAttendanceInformationLabel: `Add additional information about ${this.serviceUser.firstName}'s attendance:`,
  }
}
