import { DeliusUser } from '../../services/communityApiService'
import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'

export default class ShowReferralPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly sentBy: DeliusUser
  ) {}

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)} referral for ${ReferralDataPresenterUtils.fullName(
      this.referral.referral.serviceUser
    )}`,
  }

  readonly probationPractitionerDetails: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.firstName} ${this.sentBy.surname}`], isList: false },
    { key: 'Email address', lines: [this.sentBy.email ?? ''], isList: false },
  ]
}
