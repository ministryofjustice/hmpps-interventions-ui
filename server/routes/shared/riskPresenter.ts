import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import config from '../../config'

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export default class RiskPresenter {
  constructor(private readonly riskSummary: RiskSummary | null) {}

  readonly riskSummaryEnabled = config.apis.assessRisksAndNeedsApi.riskSummaryEnabled

  get roshAnalysisHeaders(): string[] {
    return ['Risk to', 'Risk in community']
  }

  get roshAnalysisRows(): RoshAnalysisTableRow[] {
    if (this.riskSummary === null) return []

    return Object.entries(this.riskSummary.riskInCommunity).flatMap(([riskScore, riskGroups]) => {
      return riskGroups.map(riskTo => {
        return { riskTo, riskScore }
      })
    })
  }
}
