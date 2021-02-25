import { AuthUser } from '../../data/hmppsAuthClient'
import { ServiceCategory } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'

export default class CheckAssignmentPresenter {
  constructor(
    private readonly referralId: string,
    private readonly assignee: AuthUser,
    private readonly email: string,
    private readonly serviceCategory: ServiceCategory
  ) {}

  readonly text = {
    title: `Confirm the ${this.serviceCategory.name} referral assignment`,
  }

  readonly summary: SummaryListItem[] = [
    { key: 'Name', lines: [ReferralDataPresenterUtils.fullName(this.assignee)], isList: false },
    { key: 'Email address', lines: [this.email], isList: false },
  ]

  readonly hiddenFields = {
    email: this.email,
  }

  readonly formAction = `/service-provider/referrals/${this.referralId}/assignment`
}
