import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import config from '../../config'
import DateUtils from '../../utils/dateUtils'

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export default class RiskPresenter {
  constructor(private readonly riskSummary: RiskSummary | null) {}

  readonly riskSummaryEnabled = config.apis.assessRisksAndNeedsApi.riskSummaryEnabled

  readonly riskSummaryNotFound = this.riskSummary === null

  get riskInformationAvailable(): boolean {
    return this.riskSummaryEnabled && !this.riskSummaryNotFound
  }

  readonly text = {
    whoIsAtRisk: this.riskSummary?.summary.whoIsAtRisk,
    natureOfRisk: this.riskSummary?.summary.natureOfRisk,
    riskImminence: this.riskSummary?.summary.riskImminence,
  }

  get lastUpdated(): string {
    const assessedOn = this.riskSummary?.assessedOn
      ? DateUtils.formattedDate(this.riskSummary.assessedOn, { month: 'short' })
      : 'assessment date not found'

    return `Last updated: ${assessedOn}`
  }

  get roshAnalysisHeaders(): string[] {
    return ['Risk to', 'Risk in community']
  }

  private get overallRoshScore(): string {
    if (!this.riskSummary) {
      return 'Rosh score not found'
    }

    const { riskInCommunity } = this.riskSummary.summary

    const roshRankings = ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW']

    let i = 0

    // For each roshRanking, check to see if it is defined. If not, step to the
    // next, rinse and repeat.
    while (riskInCommunity[roshRankings[i]] === undefined) {
      i += 1
    }

    // Return whichever roshRanking was the first defined one we came across
    return roshRankings[i]
  }

  get formattedOverallRoshScore(): string {
    return this.overallRoshScore.replace('_', ' ')
  }

  get overallRoshStyle(): string {
    switch (this.overallRoshScore) {
      case 'LOW':
        return 'rosh-analysis-table--low'
      case 'MEDIUM':
        return 'rosh-analysis-table--medium'
      case 'HIGH':
        return 'rosh-analysis-table--high'
      case 'VERY_HIGH':
        return 'rosh-analysis-table--very-high'
      default:
        return ''
    }
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
