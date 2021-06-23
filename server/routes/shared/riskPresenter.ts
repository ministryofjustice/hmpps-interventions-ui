import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export default class RiskPresenter {
  constructor(private readonly riskSummary: RiskSummary | null) {}

  readonly riskSummaryEnabled = this.riskSummary !== null

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
