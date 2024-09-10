import { Risk } from '../../../../models/assessRisksAndNeeds/riskSummary'

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

export class RiskInformationLabels {
  get noAdditionalRiskInformationLabel(): RiskInformationLabelArgs {
    return {
      class: 'app-oasys-text app-oasys-text--dark-grey',
      text: 'None',
    }
  }

  get noInformationProvidedLabel(): RiskInformationLabelArgs {
    return {
      class: 'app-oasys-text app-oasys-text--dark-grey',
      text: 'No information provided',
    }
  }

  riskToSelfLabel(risk: Risk | undefined | null): RiskToSelfLabelArgs {
    return {
      class: this.riskToSelfLabelClass(risk),
      text: this.riskToSelfLabelText(risk),
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
