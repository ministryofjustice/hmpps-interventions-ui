import { User } from '../../data/hmppsAuthClient'
import { ServiceCategory } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'

export default class CheckAssignmentPresenter {
  constructor(
    private readonly referralId: string,
    private readonly assignee: User,
    private readonly email: string,
    private readonly serviceCategory: ServiceCategory
  ) {}

  readonly text = {
    title: `Confirm the ${this.serviceCategory.name} referral assignment`,
  }

  readonly summary: SummaryListItem[] = [
    { key: 'Name', lines: [this.assignee.name], isList: false },
    { key: 'Email address', lines: [this.email], isList: false },
  ]

  readonly hiddenFields = {
    email: this.email,
  }

  readonly formAction = `/service-provider/referrals/${this.referralId}/assignment`
}
