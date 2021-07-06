import DeliusServiceUser from '../../../../../../models/delius/deliusServiceUser'
import { ActionPlanAppointment } from '../../../../../../models/actionPlan'
import DateUtils from '../../../../../../utils/dateUtils'
import { FormValidationError } from '../../../../../../utils/formValidationError'
import PresenterUtils from '../../../../../../utils/presenterUtils'
import { SummaryListItem } from '../../../../../../utils/summaryList'

export default class PostSessionAttendanceFeedbackPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    title: `Add attendance feedback`,
    subTitle: 'Session details',
    attendanceQuestion: this.attendanceQuestion,
    attendanceQuestionHint: 'Select one option',
    additionalAttendanceInformationLabel: `Add additional information about ${this.serviceUser.firstName}'s attendance:`,
  }

  get attendanceQuestion(): string {
    switch (this.appointment.appointmentDeliveryType) {
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

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly sessionDetailsSummary: SummaryListItem[] = [
    {
      key: 'Date',
      lines: [DateUtils.getDateStringFromDateTimeString(this.appointment.appointmentTime)],
    },
    {
      key: 'Time',
      lines: [DateUtils.getTimeStringFromDateTimeString(this.appointment.appointmentTime)],
    },
  ]

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
