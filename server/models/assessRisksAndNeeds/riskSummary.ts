export type RiskScore = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

export default interface RiskSummary {
  summary: {
    whoIsAtRisk?: string | null
    natureOfRisk?: string | null
    riskImminence?: string | null
    riskIncreaseFactors?: string | null
    riskMitigationFactors?: string | null
    riskInCommunity: Partial<Record<RiskScore, string[]>>
  }
}
