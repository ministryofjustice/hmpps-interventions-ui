import { DeliusServiceUser } from '../../../services/communityApiService'
import { ActionPlanAppointment } from '../../../services/interventionsService'
import DateUtils from '../../../utils/dateUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import { SummaryListItem } from '../../../utils/summaryList'
import ServiceUserBannerPresenter from '../../shared/serviceUserBannerPresenter'

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
    attendanceQuestion: `Did ${this.serviceUser.firstName} attend this session?`,
    attendanceQuestionHint: 'Select one option',
    additionalAttendanceInformationLabel: `Add additional information about ${this.serviceUser.firstName}'s attendance:`,
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly sessionDetailsSummary: SummaryListItem[] = [
    {
      key: 'Date',
      lines: [DateUtils.getDateStringFromDateTimeString(this.appointment.appointmentTime)],
      isList: false,
    },
    {
      key: 'Time',
      lines: [DateUtils.getTimeStringFromDateTimeString(this.appointment.appointmentTime)],
      isList: false,
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
