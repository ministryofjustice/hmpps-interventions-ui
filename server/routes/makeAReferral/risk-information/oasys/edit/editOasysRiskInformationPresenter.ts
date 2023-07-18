import RiskSummary from '../../../../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../../../../utils/dateUtils'

import RoshPanelPresenter from '../../../../shared/roshPanelPresenter'
import PresenterUtils from '../../../../../utils/presenterUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { DraftOasysRiskInformation } from '../../../../../models/draftOasysRiskInformation'

export default class EditOasysRiskInformationPresenter {
  riskPresenter: RoshPanelPresenter

  displayLabel

  constructor(
    readonly riskSummary: RiskSummary | null,
    readonly draftOasysRiskInformation: DraftOasysRiskInformation | null,
    private readonly error: FormValidationError | null = null,
    readonly label: string
  ) {
    this.riskPresenter = new RoshPanelPresenter(riskSummary)
    this.displayLabel = label
  }

  readonly errors = {
    summary: PresenterUtils.errorSummary(this.error),
    confirmUnderstood: PresenterUtils.errorMessage(this.error, 'confirm-understood'),
  }

  get latestAssessment(): string {
    return this.riskSummary?.assessedOn
      ? DateUtils.formattedDate(this.riskSummary.assessedOn, { month: 'long' })
      : 'Assessment date not found'
  }
}
