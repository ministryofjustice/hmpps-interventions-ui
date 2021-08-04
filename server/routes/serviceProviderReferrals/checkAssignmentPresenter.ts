import { SummaryListItem } from '../../utils/summaryList'
import PresenterUtils from '../../utils/presenterUtils'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import Intervention from '../../models/intervention'
import utils from '../../utils/utils'

export default class CheckAssignmentPresenter {
  constructor(
    private readonly referralId: string,
    private readonly draftAssignmentId: string,
    private readonly assignee: AuthUserDetails,
    private readonly email: string,
    private readonly intervention: Intervention
  ) {}

  readonly text = {
    title: `Confirm the ${utils.convertToProperCase(this.intervention.contractType.name)} referral assignment`,
  }

  readonly summary: SummaryListItem[] = [
    { key: 'Name', lines: [PresenterUtils.fullName(this.assignee)] },
    { key: 'Email address', lines: [this.email] },
  ]

  readonly formAction = `/service-provider/referrals/${this.referralId}/assignment/${this.draftAssignmentId}/submit`
}
