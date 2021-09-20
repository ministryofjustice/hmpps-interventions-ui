import DraftReferral from '../../../../../models/draftReferral'
import RiskSummary from '../../../../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../../../../utils/dateUtils'

export default class OasysRiskInformationPresenter {
  constructor(private readonly referral: DraftReferral, readonly riskSummary: RiskSummary) {}

  readonly additionalInformation = this.referral.additionalRiskInformation

  get latestAssessment(): string {
    return DateUtils.formattedDate(this.riskSummary.assessedOn)
  }
}
