import { DeliusServiceUser } from '../../services/communityApiService'
import { ActionPlanAppointment } from '../../services/interventionsService'
import DateUtils from '../../utils/dateUtils'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import { SummaryListItem } from '../../utils/summaryList'
import ServiceUserBannerPresenter from '../shared/serviceUserBannerPresenter'

export default class PostSessionFeedbackPresenter {
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

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'attended')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly attendanceResponses = [
    {
      value: 'yes',
      text: 'Yes, they were on time',
      checked: this.appointment.attendance?.attended === 'yes',
    },
    {
      value: 'late',
      text: 'They were late',
      checked: this.appointment.attendance?.attended === 'late',
    },
    {
      value: 'no',
      text: 'No',
      checked: this.appointment.attendance?.attended === 'no',
    },
  ]

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
    additionalAttendanceInformationValue: new PresenterUtils(this.userInputData).stringValue(
      this.appointment.attendance?.additionalAttendanceInformation || null,
      'additional-attendance-information'
    ),
  }
}
