import SentReferral from '../../models/sentReferral'
import { SummaryListItem } from '../../utils/summaryList'
import PresenterUtils from '../../utils/presenterUtils'
import utils from '../../utils/utils'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import Intervention from '../../models/intervention'

export default class AssignmentConfirmationPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
    private readonly assignee: AuthUserDetails
  ) {}

  readonly dashboardHref = '/service-provider/dashboard'

  readonly summary: SummaryListItem[] = [
    {
      key: 'Name',
      lines: [PresenterUtils.fullName(this.sentReferral.referral.serviceUser)],
    },
    {
      key: 'Referral number',
      lines: [this.sentReferral.referenceNumber],
    },
    {
      key: 'Service type',
      lines: [utils.convertToProperCase(this.intervention.contractType.name)],
    },
    {
      key: 'Assigned to',
      lines: [PresenterUtils.fullName(this.assignee)],
    },
  ]
}
