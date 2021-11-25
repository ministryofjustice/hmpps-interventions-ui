export interface SupplementaryRiskInformation {
  riskSummaryComments: string
  redactedRisk: {
    riskWho: string
    riskWhen: string
    riskNature: string
    concernsSelfHarm: string
    concernsSuicide: string
    concernsHostel: string
    concernsVulnerability: string
  }
}
