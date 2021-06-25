export type RiskScore = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

export type RiskResponse = 'YES' | 'NO' | 'DK'

export interface Risk {
  risk: RiskResponse | null
  current: RiskResponse | null
  currentConcernsText: string | null
}

export default interface RiskSummary {
  riskToSelf: {
    suicide?: Risk | null
    selfHarm?: Risk | null
    custody?: Risk | null
    hostelSetting?: Risk | null
    vulnerability?: Risk | null
  }
  summary: {
    whoIsAtRisk?: string | null
    natureOfRisk?: string | null
    riskImminence?: string | null
    riskIncreaseFactors?: string | null
    riskMitigationFactors?: string | null
    riskInCommunity: Partial<Record<RiskScore, string[]>>
  }
}
