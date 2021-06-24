import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import config from '../../config'

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export default class RiskPresenter {
  constructor(private readonly riskSummary: RiskSummary | null) {}

  readonly riskSummaryEnabled = config.apis.assessRisksAndNeedsApi.riskSummaryEnabled

  readonly riskSummaryNotFound = this.riskSummary === null

  readonly text = {
    whoIsAtRisk: this.riskSummary?.summary.whoIsAtRisk,
    natureOfRisk: this.riskSummary?.summary.natureOfRisk,
    riskImminence: this.riskSummary?.summary.riskImminence,
  }

  get roshAnalysisHeaders(): string[] {
    return ['Risk to', 'Risk in community']
  }

  get roshAnalysisRows(): RoshAnalysisTableRow[] {
    if (this.riskSummary === null) return []

    return Object.entries(this.riskSummary.summary.riskInCommunity).flatMap(([riskScore, riskGroups]) => {
      return riskGroups.map(riskTo => {
        return { riskTo, riskScore }
      })
    })
  }
}
