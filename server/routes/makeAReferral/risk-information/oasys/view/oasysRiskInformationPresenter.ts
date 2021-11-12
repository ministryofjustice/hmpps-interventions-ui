import RiskSummary from '../../../../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../../../../utils/dateUtils'
import { SupplementaryRiskInformation } from '../../../../../models/assessRisksAndNeeds/supplementaryRiskInformation'

import RiskPresenter from '../../../../shared/riskPresenter'

export default class OasysRiskInformationPresenter {
  riskPresenter: RiskPresenter

  constructor(
    readonly supplementaryRiskInformation: SupplementaryRiskInformation | null,
    readonly riskSummary: RiskSummary | null
  ) {
    this.riskPresenter = new RiskPresenter(riskSummary)
  }

  get latestAssessment(): string {
    return this.riskSummary?.assessedOn
      ? DateUtils.formattedDate(this.riskSummary.assessedOn, { month: 'long' })
      : 'Assessment date not found'
  }
}
