import SentReferral from '../../../../models/sentReferral'
import { SummaryListItem } from '../../../../utils/summaryList'
import utils from '../../../../utils/utils'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class ActionPlanConfirmationPresenter {
  constructor(private readonly sentReferral: SentReferral, private readonly interventionTitle: string) {}

  progressHref = `/service-provider/referrals/${this.sentReferral.id}/progress`

  text = {
    whatHappensNext:
      'The action plan has been saved and submitted to the probation practitioner for approval. They’ll get in touch with you to make amendments if needed and you’ll get an email once it’s been approved.',
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
