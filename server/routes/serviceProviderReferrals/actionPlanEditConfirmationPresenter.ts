import SentReferral from '../../models/sentReferral'

export default class ActionPlanEditConfirmationPresenter {
  constructor(private readonly sentReferral: SentReferral) {}

  readonly viewActionPlanUrl = `/service-provider/referrals/${this.sentReferral.id}/action-plan`

  readonly confirmAction = `/service-provider/referrals/${this.sentReferral.id}/action-plan/edit`

  readonly actionPlanId = this.sentReferral.actionPlanId
}
