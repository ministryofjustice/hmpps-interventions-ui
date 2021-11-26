import { SupplementaryRiskInformation } from '../../../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../../../../models/assessRisksAndNeeds/riskSummary'
import { RiskInformationArgs, RiskInformationLabels } from './riskInformationLabels'

// This is for presenting the supplementary risk information that the user has entered as part of Make A Referral
// i.e. the edited OAsys risk information
export default class ArnRiskSummaryView {
  private readonly riskInformationLabels: RiskInformationLabels

  constructor(
    readonly riskSummary: RiskSummary | null,
    readonly supplementaryRiskInformation: SupplementaryRiskInformation
  ) {
    this.riskInformationLabels = new RiskInformationLabels()
  }

  get supplementaryRiskInformationArgs(): RiskInformationArgs {
    const riskToSelf = this.riskSummary?.riskToSelf
    return {
      summary: {
        whoIsAtRisk: {
          text: this.supplementaryRiskInformation?.redactedRisk?.riskWho || null,
        },
        natureOfRisk: {
          text: this.supplementaryRiskInformation?.redactedRisk?.riskNature || null,
        },
        riskImminence: {
          text: this.supplementaryRiskInformation?.redactedRisk?.riskWhen || null,
        },
      },
      riskToSelf: {
        suicide: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.suicide),
          text: this.supplementaryRiskInformation?.redactedRisk?.concernsSuicide || null,
        },
        selfHarm: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.selfHarm),
          text: this.supplementaryRiskInformation?.redactedRisk?.concernsSelfHarm || null,
        },
        hostelSetting: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.hostelSetting),
          text: this.supplementaryRiskInformation?.redactedRisk?.concernsHostel || null,
        },
        vulnerability: {
          label: this.riskInformationLabels.riskToSelfLabel(riskToSelf?.vulnerability),
          text: this.supplementaryRiskInformation?.redactedRisk?.concernsVulnerability || null,
        },
      },
      additionalRiskInformation: {
        label: this.supplementaryRiskInformation?.riskSummaryComments
          ? undefined
          : this.riskInformationLabels.noAdditionalRiskInformationLabel,
        text: this.supplementaryRiskInformation ? this.supplementaryRiskInformation.riskSummaryComments : null,
      },
    }
  }
}
