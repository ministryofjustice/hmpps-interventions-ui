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
  }

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly sessionDetailsSummary: SummaryListItem[] = [
    {
      key: 'Date',
      lines: [DateUtils.getDateFromFormattedDateTime(this.appointment.appointmentTime)],
      isList: false,
    },
    {
      key: 'Time',
      lines: [DateUtils.getTimeFromFormattedDateTime(this.appointment.appointmentTime)],
      isList: false,
    },
  ]
}
