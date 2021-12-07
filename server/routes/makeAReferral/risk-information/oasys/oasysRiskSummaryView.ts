import RiskSummary from '../../../../models/assessRisksAndNeeds/riskSummary'
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
          text: riskToSelf?.suicide ? riskToSelf.suicide.currentConcernsText : null,
        },
        selfHarm: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.selfHarm),
          text: riskToSelf?.selfHarm ? riskToSelf?.selfHarm.currentConcernsText : null,
        },
        hostelSetting: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.hostelSetting),
          text: riskToSelf?.hostelSetting ? riskToSelf?.hostelSetting.currentConcernsText : null,
        },
        vulnerability: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.vulnerability),
          text: riskToSelf?.vulnerability ? riskToSelf.vulnerability.currentConcernsText : null,
        },
      },
      additionalRiskInformation: {
        label: this.riskInformationLabels.noAdditionalRiskInformationLabel,
        text: null,
      },
    }
  }
}
