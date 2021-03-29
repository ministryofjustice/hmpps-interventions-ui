import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import PresenterUtils from '../../utils/presenterUtils'
import { DeliusUser } from '../../services/communityApiService'

export default class PostSessionFeedbackConfirmationPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly probationPractitioner: DeliusUser
  ) {}

  progressHref = `/service-provider/referrals/${this.sentReferral.id}/progress`

  text = {
    whatHappensNext: `The session feedback form has been saved and submitted to ${this.probationPractitioner.firstName} ${this.probationPractitioner.surname}, probation practitioner. Please deliver the next session.`,
  }

  readonly summary: SummaryListItem[] = [
    {
      key: 'Name',
      lines: [PresenterUtils.fullName(this.sentReferral.referral.serviceUser)],
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
