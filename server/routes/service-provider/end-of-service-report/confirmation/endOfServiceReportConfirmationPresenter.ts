import SentReferral from '../../../../models/sentReferral'
import PresenterUtils from '../../../../utils/presenterUtils'
import { SummaryListItem } from '../../../../utils/summaryList'
import utils from '../../../../utils/utils'

export default class EndOfServiceReportConfirmationPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly interventionTitle: string
  ) {}

  progressHref = `/service-provider/referrals/${this.referral.id}/progress`

  readonly summary: SummaryListItem[] = [
    {
      key: 'Name',
      lines: [PresenterUtils.fullName(this.referral.referral.serviceUser)],
    },
    {
      key: 'Referral number',
      lines: [this.referral.referenceNumber],
    },
    {
      key: 'Service category',
      lines: [utils.convertToProperCase(this.interventionTitle)],
    },
  ]
}
