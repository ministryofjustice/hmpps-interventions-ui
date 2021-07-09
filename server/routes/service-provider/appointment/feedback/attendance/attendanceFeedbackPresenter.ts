import PresenterUtils from '../../../../../utils/presenterUtils'
import { SummaryListItem } from '../../../../../utils/summaryList'
import DateUtils from '../../../../../utils/dateUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { AppointmentDeliveryType } from '../../../../../models/appointmentDeliveryType'
import Address from '../../../../../models/address'
import SessionFeedback from '../../../../../models/sessionFeedback'

interface AttendanceFeedbackFormText {
  title: string
  subTitle: string
  attendanceQuestion: string
  attendanceQuestionHint: string
  additionalAttendanceInformationLabel: string
}
export interface AttendanceAppointmentDetails {
  appointmentTime: string | null
  durationInMinutes: number | null
  appointmentDeliveryType: AppointmentDeliveryType | null
  appointmentDeliveryAddress: Address | null
  sessionFeedback: SessionFeedback
}

export default abstract class AttendanceFeedbackPresenter {
  protected constructor(
    private readonly appointmentDetails: AttendanceAppointmentDetails,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  abstract readonly text: AttendanceFeedbackFormText

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly sessionDetailsSummary: SummaryListItem[] = [
    {
      key: 'Date',
      lines: [DateUtils.getDateStringFromDateTimeString(this.appointmentDetails.appointmentTime)],
    },
    {
      key: 'Time',
      lines: [DateUtils.getTimeStringFromDateTimeString(this.appointmentDetails.appointmentTime)],
    },
  ]

  readonly fields = {
    attended: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointmentDetails.sessionFeedback?.attendance?.attended ?? null,
        'attended'
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, 'attended'),
    },
    additionalAttendanceInformation: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointmentDetails.sessionFeedback?.attendance?.additionalAttendanceInformation ?? null,
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
