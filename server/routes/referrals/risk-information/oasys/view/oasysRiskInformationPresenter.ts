import RiskSummary from '../../../../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../../../../utils/dateUtils'
import { SupplementaryRiskInformation } from '../../../../../models/assessRisksAndNeeds/supplementaryRiskInformation'

export default class OasysRiskInformationPresenter {
  constructor(
    readonly supplementaryRiskInformation: SupplementaryRiskInformation | null,
    readonly riskSummary: RiskSummary
  ) {}

  get latestAssessment(): string {
    return DateUtils.formattedDate(this.riskSummary.assessedOn)
  }
}
