import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import DateUtils from '../../utils/dateUtils'
import logger from '../../../log'

export type RoshLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW'
export type UnknownLevel = 'UNKNOWN_NOT_COMPLETED' | 'UNKNOWN_NOT_AVAILABLE'
export type RoshLevelOrUnknown = RoshLevel | UnknownLevel

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export default class RoshPanelPresenter {
  constructor(private readonly riskSummary: RiskSummary | null) {}

  get riskInformationAvailable(): boolean {
    return this.riskSummary != null
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
    return ['Risk to', 'Community']
  }

  private get overallRoshScore(): string {
    if (!this.riskSummary) {
      return 'UNKNOWN_NOT_AVAILABLE'
    }

    const riskInCommunity = this.riskSummary.summary.riskInCommunity

    const roshRankings: RoshLevel[] = ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW']

    const ranking = roshRankings.find(level => {
      const entries = riskInCommunity[level]
      return entries?.length
    })

    if (!ranking) {
      logger.error({
        err: `Unable to determine ROSH score from keys: ${Object.keys(riskInCommunity)}`,
      })
      return 'UNKNOWN_NOT_COMPLETED'
    }

    return ranking
  }

  get overallRoshStyle(): string {
    const styleMap: Record<RoshLevelOrUnknown, string> = {
      LOW: 'rosh-analysis-table--low',
      MEDIUM: 'rosh-analysis-table--medium',
      HIGH: 'rosh-analysis-table--high',
      VERY_HIGH: 'rosh-analysis-table--very-high',
      UNKNOWN_NOT_COMPLETED: 'rosh-analysis-table--unknown-not-completed',
      UNKNOWN_NOT_AVAILABLE: 'rosh-analysis-table--unknown-not-available',
    }

    return styleMap[this.overallRoshScore] ?? styleMap['UNKNOWN_NOT_AVAILABLE']
  }

  private readonly UNKNOWN_LEVELS: ReadonlySet<UnknownLevel> = new Set([
    'UNKNOWN_NOT_COMPLETED',
    'UNKNOWN_NOT_AVAILABLE',
  ])

  private isUnknownLevel(level: string): level is UnknownLevel {
    return this.UNKNOWN_LEVELS.has(level as UnknownLevel)
  }

  get formattedOverallRoshScore(): string {
    const level = this.overallRoshScore

    return this.isUnknownLevel(level) ? 'UNKNOWN LEVEL' : level.replace('_', ' ')
  }

  get roshSummaryMessage(): string | null {
    if (!this.riskInformationAvailable) {
      return 'Something went wrong. We are unable to show ROSH information at this time. Try again later.'
    }

    if (this.isUnknownLevel(this.overallRoshScore)) {
      return `A ROSH summary has not been completed for this individual. Check OASys for this person's current assessment status.`
    }

    return null
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
