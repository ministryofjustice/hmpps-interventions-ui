import { SupplementaryRiskInformation } from '../../../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary, { Risk } from '../../../../models/assessRisksAndNeeds/riskSummary'

export interface RiskInformationLabelArgs {
  class: string
  text: string
}
export type RiskToSelfLabelText = 'Yes' | 'No' | "Don't know"
export interface RiskToSelfLabelArgs {
  class: string
  text: RiskToSelfLabelText
}
export interface RiskInformationArgs {
  summary: {
    whoIsAtRisk: {
      label?: RiskInformationLabelArgs
      text: string | null
    }
    natureOfRisk: {
      label?: RiskInformationLabelArgs
      text: string | null
    }
    riskImminence: {
      label?: RiskInformationLabelArgs
      text: string | null
    }
  }
  riskToSelf: {
    suicide: {
      label: RiskToSelfLabelArgs
      text: string | null
    }
    selfHarm: {
      label: RiskToSelfLabelArgs
      text: string | null
    }
    hostelSetting: {
      label: RiskToSelfLabelArgs
      text: string | null
    }
    vulnerability: {
      label: RiskToSelfLabelArgs
      text: string | null
    }
  }
  additionalRiskInformation: {
    label?: RiskInformationLabelArgs
    text: string | null
  }
}
export default class OasysRiskSummaryView {
  constructor(
    readonly supplementaryRiskInformation: SupplementaryRiskInformation | null,
    readonly riskSummary: RiskSummary
  ) {}

  get riskInformation(): RiskInformationArgs {
    const { summary, riskToSelf } = this.riskSummary
    return {
      summary: {
        whoIsAtRisk: {
          label: summary.whoIsAtRisk ? undefined : this.noInformationProvidedLabel,
          text: summary.whoIsAtRisk ? summary.whoIsAtRisk : null,
        },
        natureOfRisk: {
          label: summary.natureOfRisk ? undefined : this.noInformationProvidedLabel,
          text: summary.natureOfRisk ? summary.natureOfRisk : null,
        },
        riskImminence: {
          label: summary.riskImminence ? undefined : this.noInformationProvidedLabel,
          text: summary.riskImminence ? summary.riskImminence : null,
        },
      },
      riskToSelf: {
        suicide: {
          label: {
            class: this.riskToSelfLabelClass(riskToSelf.suicide),
            text: this.riskToSelfLabelText(riskToSelf.suicide),
          },
          text: riskToSelf.suicide ? riskToSelf.suicide.currentConcernsText : null,
        },
        selfHarm: {
          label: {
            class: this.riskToSelfLabelClass(riskToSelf.selfHarm),
            text: this.riskToSelfLabelText(riskToSelf.selfHarm),
          },
          text: riskToSelf.selfHarm ? riskToSelf.selfHarm.currentConcernsText : null,
        },
        hostelSetting: {
          label: {
            class: this.riskToSelfLabelClass(riskToSelf.hostelSetting),
            text: this.riskToSelfLabelText(riskToSelf.hostelSetting),
          },
          text: riskToSelf.hostelSetting ? riskToSelf.hostelSetting.currentConcernsText : null,
        },
        vulnerability: {
          label: {
            class: this.riskToSelfLabelClass(riskToSelf.vulnerability),
            text: this.riskToSelfLabelText(riskToSelf.vulnerability),
          },
          text: riskToSelf.vulnerability ? riskToSelf.vulnerability.currentConcernsText : null,
        },
      },
      additionalRiskInformation: {
        label: this.supplementaryRiskInformation ? undefined : this.noAdditionalRiskInformationLabel,
        text: this.supplementaryRiskInformation ? this.supplementaryRiskInformation.riskSummaryComments : null,
      },
    }
  }

  private get noAdditionalRiskInformationLabel(): RiskInformationLabelArgs {
    return {
      class: 'app-oasys-text app-oasys-text--dark-grey',
      text: 'None',
    }
  }

  private get noInformationProvidedLabel(): RiskInformationLabelArgs {
    return {
      class: 'app-oasys-text app-oasys-text--dark-grey',
      text: 'No information provided',
    }
  }

  private riskToSelfLabelText(risk: Risk | undefined | null): RiskToSelfLabelText {
    if (!risk) {
      return "Don't know"
    }
    switch (risk.current) {
      case 'YES':
        return 'Yes'
      case 'NO':
        return 'No'
      default:
        return "Don't know"
    }
  }

  private riskToSelfLabelClass(risk: Risk | undefined | null): string {
    if (!risk) {
      return 'app-oasys-text app-oasys-text--dark-grey'
    }
    switch (risk.current) {
      case 'YES':
        return 'app-oasys-text app-oasys-text--green'
      case 'NO':
        return 'app-oasys-text app-oasys-text--red'
      default:
        return 'app-oasys-text app-oasys-text--dark-grey'
    }
  }
}
