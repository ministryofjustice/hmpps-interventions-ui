import ServiceCategory from '../../models/serviceCategory'
import { SummaryListItem } from '../../utils/summaryList'
import PresenterUtils from '../../utils/presenterUtils'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

export default class CheckAssignmentPresenter {
  constructor(
    private readonly referralId: string,
    private readonly assignee: AuthUserDetails,
    private readonly email: string,
    private readonly serviceCategory: ServiceCategory
  ) {}

  readonly text = {
    title: `Confirm the ${this.serviceCategory.name} referral assignment`,
  }

  readonly summary: SummaryListItem[] = [
    { key: 'Name', lines: [PresenterUtils.fullName(this.assignee)] },
    { key: 'Email address', lines: [this.email] },
  ]

  readonly hiddenFields = {
    email: this.email,
  }

  readonly formAction = `/service-provider/referrals/${this.referralId}/assignment`
}
