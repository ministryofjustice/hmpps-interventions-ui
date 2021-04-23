import { SentReferral, ServiceCategoryFull } from '../../services/interventionsService'
import PresenterUtils from '../../utils/presenterUtils'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'

export default class EndOfServiceReportConfirmationPresenter {
  constructor(private readonly referral: SentReferral, private readonly serviceCategory: ServiceCategoryFull) {}

  progressHref = `/service-provider/referrals/${this.referral.id}/progress`

  readonly summary: SummaryListItem[] = [
    {
      key: 'Name',
      lines: [PresenterUtils.fullName(this.referral.referral.serviceUser)],
      isList: false,
    },
    {
      key: 'Referral number',
      lines: [this.referral.referenceNumber],
      isList: false,
    },
    {
      key: 'Service type',
      lines: [utils.convertToProperCase(this.serviceCategory.name)],
      isList: false,
    },
  ]
}
