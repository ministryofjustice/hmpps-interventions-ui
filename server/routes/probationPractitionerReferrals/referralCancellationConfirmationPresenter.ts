import { DeliusServiceUser } from '../../services/communityApiService'
import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import PresenterUtils from '../../utils/presenterUtils'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import ServiceUserBannerPresenter from '../shared/serviceUserBannerPresenter'

export default class ReferralCancellationConfirmationPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly serviceUser: DeliusServiceUser
  ) {}

  readonly text = {
    confirmationText: 'This referral has been cancelled',
    whatHappensNextText:
      "Service provider will be notified about the cancellation. You don't have to do anything else.",
  }

  readonly myCasesHref = '/probation-practitioner/dashboard'

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly serviceUserSummary: SummaryListItem[] = [
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
      key: 'Type of referral',
      lines: [utils.convertToProperCase(this.serviceCategory.name)],
      isList: false,
    },
  ]
}
