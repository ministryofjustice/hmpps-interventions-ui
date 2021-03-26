import { DeliusServiceUser } from '../../services/communityApiService'
import { ActionPlanAppointment, ServiceCategory } from '../../services/interventionsService'
import DateUtils from '../../utils/dateUtils'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'

export default class PostSessionFeedbackPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly serviceCategory: ServiceCategory
  ) {}

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)}: add feedback`,
    subTitle: 'Session details',
    attendanceQuestion: `Did ${this.serviceUser.firstName} attend this session?`,
  }

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
}
