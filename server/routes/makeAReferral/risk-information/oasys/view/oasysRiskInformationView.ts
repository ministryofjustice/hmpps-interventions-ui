import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import { Risk } from '../../../../../models/assessRisksAndNeeds/riskSummary'
import RiskView from '../../../../shared/riskView'
import { CheckboxesArgs, DetailsArgs, RadiosArgs } from '../../../../../utils/govukFrontendTypes'

interface RiskInformationLabelArgs {
  class: string
  text: string
}
type RiskToSelfLabelText = 'Yes' | 'No' | "Don't know"
interface RiskToSelfLabelArgs {
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
export default class OasysRiskInformationView {
  riskView: RiskView

  constructor(private readonly presenter: OasysRiskInformationPresenter) {
    this.riskView = new RiskView(this.presenter.riskPresenter, 'probation-practitioner')
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

  private get sensitiveInformationDetailsArgs(): DetailsArgs {
    return {
      summaryText: 'What is sensitive information',
      html:
        '<p class="govuk-body">Sensitive information can include personal information or risk-related information received directly from the person on probation or communicated by third parties.</p>' +
        '<p class="govuk-body">It can include, but is not limited to:</p>' +
        '<ul>' +
        "<li>a victim's personal details</li>" +
        '<li>personal details of other individuals</li>' +
        '<li>police information that the person on probation cannot be made aware of</li>' +
        "<li>safeguarding information from children's services</li>" +
        '<li>information from mental health agencies</li>' +
        '</ul>' +
        '<p class="govuk-body">You should carefully consider:</p>' +
        '<ul>' +
        '<li>could the information cause harm or undermine the investigation of a crime if it were disclosed to the person on probation?</li>' +
        '<li>is the information relevant to the risk management of the individual?</li>' +
        '<li>is it necessary?</li>' +
        '<li>can sensitive information be removed, or a safe summary provided?</li>' +
        '</ul>',
    }
  }

  private get confirmUnderstoodWarningCheckboxArgs(): CheckboxesArgs {
    return {
      idPrefix: 'confirm-understood',
      name: 'confirm-understood[]',
      items: [
        {
          value: 'understood',
          text: 'I understand this information will be shared with the service provider',
        },
      ],
      classes: 'govuk-checkboxes__inset--grey',
    }
  }

  private editRiskConfirmationRadioButtonArgs(noEditRiskSelectionHTML: string): RadiosArgs {
    return {
      classes: 'govuk-radios',
      idPrefix: 'edit-risk-confirmation',
      name: 'relevant-sentence-id',
      fieldset: {
        legend: {
          text: 'Do you want to edit this OASys risk information for the service provider?',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
        },
        {
          value: 'no',
          text: 'No',
          conditional: {
            html: noEditRiskSelectionHTML,
          },
        },
      ],
    }
  }

  get riskInformation(): RiskInformationArgs {
    const { supplementaryRiskInformation } = this.presenter
    const { summary, riskToSelf } = this.presenter.riskSummary
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
        label: supplementaryRiskInformation ? undefined : this.noAdditionalRiskInformationLabel,
        text: supplementaryRiskInformation ? supplementaryRiskInformation.riskSummaryComments : null,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/riskInformationOasys',
      {
        riskInformation: this.riskInformation,
        latestAssessment: this.presenter.latestAssessment,
        roshPanelPresenter: this.presenter.riskPresenter,
        roshAnalysisTableArgs: this.riskView.roshAnalysisTableArgs.bind(this.riskView),
        editRiskConfirmationRadioButtonArgs: this.editRiskConfirmationRadioButtonArgs.bind(this),
        confirmUnderstoodWarningCheckboxArgs: this.confirmUnderstoodWarningCheckboxArgs,
        sensitiveInformationDetailsArgs: this.sensitiveInformationDetailsArgs,
        noInformationProvided: this.noInformationProvidedLabel,
      },
    ]
  }
}
