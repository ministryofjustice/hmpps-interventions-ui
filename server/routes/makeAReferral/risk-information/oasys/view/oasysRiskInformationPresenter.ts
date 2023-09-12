import RiskSummary from '../../../../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../../../../utils/dateUtils'

import RoshPanelPresenter from '../../../../shared/roshPanelPresenter'
import { FormValidationError } from '../../../../../utils/formValidationError'
import PresenterUtils from '../../../../../utils/presenterUtils'

export default class OasysRiskInformationPresenter {
  riskPresenter: RoshPanelPresenter

  readonly displayLabel: string

  constructor(
    readonly referralId: string,
    readonly riskSummary: RiskSummary | null,
    private readonly error: FormValidationError | null = null,
    readonly label: string
  ) {
    this.riskPresenter = new RoshPanelPresenter(riskSummary)
    this.displayLabel = label
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
