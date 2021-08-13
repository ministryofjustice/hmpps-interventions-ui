import PresenterUtils from '../../../../../utils/presenterUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import AttendanceFeedbackQuestionnaire from './attendanceFeedbackQuestionnaire'
import AppointmentSummary from '../../../appointmentSummary'

interface AttendanceFeedbackFormText {
  title: string
  subTitle: string
  attendanceQuestion: string
  attendanceQuestionHint: string
  additionalAttendanceInformationLabel: string
}

export default abstract class AttendanceFeedbackPresenter {
  readonly text: AttendanceFeedbackFormText

  protected constructor(
    private readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly title: string,
    private readonly subTitle: string,
    private readonly attendanceFeedbackQuestionnaire: AttendanceFeedbackQuestionnaire,
    readonly appointmentSummary: AppointmentSummary,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.text = {
      title,
      subTitle,
      attendanceQuestion: attendanceFeedbackQuestionnaire.attendanceQuestion.text,
      attendanceQuestionHint: attendanceFeedbackQuestionnaire.attendanceQuestion.hint,
      additionalAttendanceInformationLabel: attendanceFeedbackQuestionnaire.additionalAttendanceInformationQuestion,
    }
  }

  readonly backLinkHref: string | null = null

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly fields = {
    attended: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.sessionFeedback?.attendance?.attended ?? null,
        'attended'
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, 'attended'),
    },
    additionalAttendanceInformation: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.sessionFeedback?.attendance?.additionalAttendanceInformation ?? null,
        'additional-attendance-information'
      ),
    },
  }

  readonly attendanceResponses = [
    {
      value: 'yes',
      text: 'Yes, they were on time',
      checked: this.fields.attended.value === 'yes',
    },
    {
      value: 'late',
      text: 'They were late',
      checked: this.fields.attended.value === 'late',
    },
    {
      value: 'no',
      text: 'No',
      checked: this.fields.attended.value === 'no',
    },
  ]
}
