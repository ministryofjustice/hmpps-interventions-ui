import SentReferral from '../../../../models/sentReferral'
import { SummaryListItem } from '../../../../utils/summaryList'
import utils from '../../../../utils/utils'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class ActionPlanConfirmationPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly interventionTitle: string
  ) {}

  progressHref = `/service-provider/referrals/${this.sentReferral.id}/progress`

  text = {
    whatHappensNext:
      'The action plan has been submitted and will be shared with the probation practitioner. Action plans no longer require approval by the probation practitioner therfore you can commence delivery of intervention sessions immediately. Where amendments are required, the probation practitioner will contact you.',
  }

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
      key: 'Service category',
      lines: [utils.convertToProperCase(this.interventionTitle)],
    },
  ]
}
