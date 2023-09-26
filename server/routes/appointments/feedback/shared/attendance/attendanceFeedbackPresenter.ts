import PresenterUtils from '../../../../../utils/presenterUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import AttendanceFeedbackQuestionnaire from './attendanceFeedbackQuestionnaire'
import AppointmentSummary from '../../../appointmentSummary'

interface AttendanceFeedbackFormText {
  title: string
  subTitle: string
  heading: string
  pageSubTitle: string
  attendanceQuestion: string
  attendanceQuestionHint: string
  additionalAttendanceInformationLabel: string
  attendanceFailureInformationQuestion: string
}

export default abstract class AttendanceFeedbackPresenter {
  readonly text: AttendanceFeedbackFormText

  protected constructor(
    private readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly title: string,
    private readonly subTitle: string,
    private readonly heading: string,
    private readonly pageSubTitle: string,
    private readonly attendanceFeedbackQuestionnaire: AttendanceFeedbackQuestionnaire,
    readonly appointmentSummary: AppointmentSummary,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.text = {
      title,
      subTitle,
      heading,
      pageSubTitle,
      attendanceQuestion: attendanceFeedbackQuestionnaire.attendanceQuestion.text,
      attendanceQuestionHint: attendanceFeedbackQuestionnaire.attendanceQuestion.hint,
      additionalAttendanceInformationLabel: attendanceFeedbackQuestionnaire.additionalAttendanceInformationQuestion,
      attendanceFailureInformationQuestion: attendanceFeedbackQuestionnaire.attendanceFailureInformationQuestion,
    }
  }

  readonly backLinkHref: string | null = null

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly fields = {
    attended: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.attendanceFeedback?.attended ?? null,
        'attended'
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, 'attended'),
    },
    attendanceFailureInformation: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.attendanceFeedback?.attendanceFailureInformation ?? null,
        'attendance-failure-information'
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, 'attendance-failure-information'),
    },
  }

  readonly attendanceResponses = {
    yes: {
      value: 'yes',
      text: 'Yes, they were on time',
    },
    late: {
      value: 'late',
      text: 'They were late',
    },
    no: {
      value: 'no',
      text: 'No',
    },
  }
}
