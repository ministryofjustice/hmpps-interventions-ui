import RiskSummary, { Risk } from '../../../../models/assessRisksAndNeeds/riskSummary'
import { RiskInformationArgs, RiskInformationLabels } from './riskInformationLabels'

// This is for presenting the non-editable OAsys risk information in Make A Referral journey
export default class OasysRiskSummaryView {
  private readonly riskInformationLabels: RiskInformationLabels

  constructor(readonly riskSummary: RiskSummary | null) {
    this.riskInformationLabels = new RiskInformationLabels()
  }

  get oasysRiskInformationArgs(): RiskInformationArgs {
    const summary = this.riskSummary?.summary
    const riskToSelf = this.riskSummary?.riskToSelf
    return {
      summary: {
        whoIsAtRisk: {
          label: summary?.whoIsAtRisk ? undefined : this.riskInformationLabels.noInformationProvidedLabel,
          text: summary?.whoIsAtRisk ? summary.whoIsAtRisk : null,
        },
        natureOfRisk: {
          label: summary?.natureOfRisk ? undefined : this.riskInformationLabels.noInformationProvidedLabel,
          text: summary?.natureOfRisk ? summary.natureOfRisk : null,
        },
        riskImminence: {
          label: summary?.riskImminence ? undefined : this.riskInformationLabels.noInformationProvidedLabel,
          text: summary?.riskImminence ? summary.riskImminence : null,
        },
      },
      riskToSelf: {
        suicide: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.suicide),
          text: this.determineRiskToSelfText(riskToSelf?.suicide),
        },
        selfHarm: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.selfHarm),
          text: this.determineRiskToSelfText(riskToSelf?.selfHarm),
        },
        hostelSetting: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.hostelSetting),
          text: this.determineRiskToSelfText(riskToSelf?.hostelSetting),
        },
        vulnerability: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.vulnerability),
          text: this.determineRiskToSelfText(riskToSelf?.vulnerability),
        },
      },
      additionalRiskInformation: {
        label: this.riskInformationLabels.noAdditionalRiskInformationLabel,
        text: null,
      },
    }
  }

  private determineRiskToSelfText(risk: Risk | null | undefined): string | null {
    if (!risk || risk.current !== 'YES') {
      return null
    }
    return risk.currentConcernsText ? risk.currentConcernsText : null
  }
}
