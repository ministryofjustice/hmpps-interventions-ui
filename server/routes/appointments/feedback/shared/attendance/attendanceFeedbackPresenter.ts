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
  additionalAttendanceInformationLabel: string
  attendanceFailureInformationQuestion: string
  didSessionHappenQuestion: string
  didSessionHappenQuestionHint: string
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
      additionalAttendanceInformationLabel: attendanceFeedbackQuestionnaire.additionalAttendanceInformationQuestion,
      attendanceFailureInformationQuestion: attendanceFeedbackQuestionnaire.attendanceFailureInformationQuestion,
      didSessionHappenQuestion: attendanceFeedbackQuestionnaire.sessionHappenQuestion.text,
      didSessionHappenQuestionHint: attendanceFeedbackQuestionnaire.sessionHappenQuestion.hint,
    }
  }

  readonly backLinkHref: string | null = null

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly fields = {
    didSessionHappen: {
      value: new PresenterUtils(this.userInputData).booleanValue(
        this.appointment.appointmentFeedback?.attendanceFeedback.didSessionHappen ?? null,
        'did-session-happen'
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, 'did-session-happen'),
    },
    attended: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.attendanceFeedback?.attended ?? null,
        'attended'
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, 'attended'),
    },
  }

  readonly didSessionHappenResponses = {
    yes: {
      value: 'yes',
      text: 'Yes',
    },
    no: {
      value: 'no',
      text: 'No',
    },
  }

  readonly attendanceResponses = {
    yes: {
      value: 'yes',
      text: 'Yes',
    },
    no: {
      value: 'no',
      text: 'No',
    },
    dontKnow: {
      value: 'do_not_know',
      text: 'I do not know',
    },
  }
}
