import RiskSummary from '../../../../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../../../../utils/dateUtils'
import { SupplementaryRiskInformation } from '../../../../../models/assessRisksAndNeeds/supplementaryRiskInformation'

import RiskPresenter from '../../../../shared/riskPresenter'
import { FormValidationError } from '../../../../../utils/formValidationError'
import PresenterUtils from '../../../../../utils/presenterUtils'

export default class OasysRiskInformationPresenter {
  riskPresenter: RiskPresenter

  constructor(
    readonly referralId: string,
    readonly supplementaryRiskInformation: SupplementaryRiskInformation | null,
    readonly riskSummary: RiskSummary | null,
    private readonly error: FormValidationError | null = null
  ) {
    this.riskPresenter = new RiskPresenter(riskSummary)
  }

  readonly errors = {
    summary: PresenterUtils.errorSummary(this.error),
    editRiskInformation: PresenterUtils.errorMessage(this.error, 'edit-risk-confirmation'),
    confirmUnderstood: PresenterUtils.errorMessage(this.error, 'confirm-understood'),
  }

  readonly confirmEditOasysAction = `/referrals/${this.referralId}/confirm-edit-oasys-risk-information`

  get latestAssessment(): string {
    return this.riskSummary?.assessedOn
      ? DateUtils.formattedDate(this.riskSummary.assessedOn, { month: 'long' })
      : 'Assessment date not found'
  }
}
