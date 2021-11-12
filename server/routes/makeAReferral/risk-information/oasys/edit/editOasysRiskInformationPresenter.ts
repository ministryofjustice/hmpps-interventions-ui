import RiskSummary from '../../../../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../../../../utils/dateUtils'
import { SupplementaryRiskInformation } from '../../../../../models/assessRisksAndNeeds/supplementaryRiskInformation'

import RoshPanelPresenter from '../../../../shared/roshPanelPresenter'

export default class EditOasysRiskInformationPresenter {
  riskPresenter: RoshPanelPresenter

  constructor(
    readonly supplementaryRiskInformation: SupplementaryRiskInformation | null,
    readonly riskSummary: RiskSummary | null
  ) {
    this.riskPresenter = new RoshPanelPresenter(riskSummary)
  }

  get latestAssessment(): string {
    return this.riskSummary?.assessedOn
      ? DateUtils.formattedDate(this.riskSummary.assessedOn, { month: 'long' })
      : 'Assessment date not found'
  }
}
