import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'

export default class ActionPlanConfirmationPresenter {
  constructor(private readonly sentReferral: SentReferral, private readonly serviceCategory: ServiceCategory) {}

  progressHref = `/service-provider/referrals/${this.sentReferral.id}/progress`

  text = {
    whatHappensNext:
      'The action plan has been saved and submitted to the probation practitioner for approval. They’ll get in touch with you to make amendments if needed and you’ll get an email once it’s been approved.',
  }

  readonly summary: SummaryListItem[] = [
    {
      key: 'Name',
      lines: [ReferralDataPresenterUtils.fullName(this.sentReferral.referral.serviceUser)],
      isList: false,
    },
    {
      key: 'Referral number',
      lines: [this.sentReferral.referenceNumber],
      isList: false,
    },
    {
      key: 'Service type',
      lines: [utils.convertToProperCase(this.serviceCategory.name)],
      isList: false,
    },
  ]
}
