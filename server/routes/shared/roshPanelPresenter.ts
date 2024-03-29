import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../utils/dateUtils'
import logger from '../../../log'

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export default class RoshPanelPresenter {
  constructor(private readonly riskSummary: RiskSummary | null) {}

  readonly riskSummaryNotFound = this.riskSummary === null

  get riskInformationAvailable(): boolean {
    return !this.riskSummaryNotFound
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
      // If we've run out of rankings then log an error, short circuit and
      // return 'UNDEFINED'
      if (i > roshRankings.length) {
        logger.error({
          err: `Unable to get ROSH score from risk in community response: ${Object.keys(riskInCommunity)}`,
        })
        return 'UNDEFINED'
      }
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
    // This defines the display order for known RoSH groups. Other groups not in this list will be rendered at the end.
    const roshGroupsDisplayOrder = ['children', 'public', 'known adult', 'staff']

    if (this.riskSummary === null) return []

    const unsortedRiskGroups = Object.entries(this.riskSummary.summary.riskInCommunity).flatMap(
      ([riskScore, riskGroups]) => {
        return riskGroups.map(riskTo => {
          return { riskTo, riskScore }
        })
      }
    )

    const sortedRiskGroups: RoshAnalysisTableRow[] = []

    roshGroupsDisplayOrder.forEach(group => {
      // We get the index here and then push/splice using that index value to save having to `find` on the array twice
      const matchingRoshGroupIndex = unsortedRiskGroups.findIndex(obj => {
        return obj.riskTo.toLowerCase() === group
      })
      if (matchingRoshGroupIndex !== -1) {
        sortedRiskGroups.push(unsortedRiskGroups[matchingRoshGroupIndex])
        unsortedRiskGroups.splice(matchingRoshGroupIndex, 1)
      }
    })

    return [...sortedRiskGroups, ...unsortedRiskGroups]
  }
}
