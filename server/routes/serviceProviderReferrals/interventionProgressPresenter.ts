import { ActionPlan, SentReferral, ServiceCategory } from '../../services/interventionsService'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from './referralOverviewPagePresenter'
import { DeliusServiceUser } from '../../services/communityApiService'

export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly actionPlan: ActionPlan | null,
    serviceUser: DeliusServiceUser
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral,
      serviceUser
    )
  }

  get referralAssigned(): boolean {
    return this.referral.assignedTo !== null
  }

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly text = {
    title: utils.convertToTitleCase(this.serviceCategory.name),
    actionPlanStatus: this.actionPlanSubmitted ? 'Submitted' : 'Not submitted',
  }

  readonly actionPlanStatusStyle: 'active' | 'inactive' = this.actionPlanSubmitted ? 'active' : 'inactive'

  private get actionPlanSubmitted() {
    return this.actionPlan !== null && this.actionPlan.submittedAt !== null
  }

  get allowActionPlanCreation(): boolean {
    return this.actionPlan === null
  }
}
