import RiskSummary, { Risk } from '../../models/assessRisksAndNeeds/riskSummary'
import config from '../../config'
import { SummaryListItem } from '../../utils/summaryList'

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

  get riskToSelf(): SummaryListItem[] {
    if (this.riskSummary === null) return []

    return [
      this.riskToSelfSummaryItem('Concerns in relation to suicide', this.riskSummary.riskToSelf.suicide),
      this.riskToSelfSummaryItem('Concerns in relation to self-harm', this.riskSummary.riskToSelf.selfHarm),
      this.riskToSelfSummaryItem(
        'Concerns in relation to coping to a hostel setting',
        this.riskSummary.riskToSelf.hostelSetting
      ),
      this.riskToSelfSummaryItem('Concerns in relation to vulnerability', this.riskSummary.riskToSelf.vulnerability),
    ].flat()
  }

  private riskToSelfSummaryItem(key: string, risk: Risk | null | undefined): SummaryListItem[] {
    const riskToSelfSummaryItem: SummaryListItem[] = [
      {
        key,
        lines: this.riskToSelfAnswer(risk),
        hasRowLabel: !!(risk && risk.currentConcernsText),
      },
    ]
    if (risk && risk.currentConcernsText) {
      riskToSelfSummaryItem.push({
        key: '',
        lines: [risk.currentConcernsText],
        isRowLabel: true,
      })
    }
    return riskToSelfSummaryItem
  }

  private riskToSelfAnswer(risk: Risk | null | undefined): string[] {
    if (!risk) return ["Don't know"]
    switch (risk.risk) {
      case 'NO':
        return ['No']
      case 'YES':
        return ['Yes']
      default:
        return ["Don't know"]
    }
  }
}
