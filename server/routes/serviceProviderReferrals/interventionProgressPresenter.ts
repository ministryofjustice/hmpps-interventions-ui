import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import utils from '../../utils/utils'

export default class InterventionProgressPresenter {
  constructor(private readonly referral: SentReferral, private readonly serviceCategory: ServiceCategory) {}

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly text = {
    title: utils.convertToTitleCase(this.serviceCategory.name),
    actionPlanStatus: 'Not submitted',
  }

  readonly actionPlanStatusColour: 'active' | 'inactive' = 'inactive'
}
