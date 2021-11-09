import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import RiskView from '../../../../shared/riskView'
import { CheckboxesArgs, DetailsArgs, RadiosArgs } from '../../../../../utils/govukFrontendTypes'
import OasysRiskSummaryView from '../oasysRiskSummaryView'

export default class OasysRiskInformationView {
  riskView: RiskView

  riskSummaryView: OasysRiskSummaryView

  constructor(readonly presenter: OasysRiskInformationPresenter) {
    this.riskView = new RiskView(this.presenter.riskPresenter, 'probation-practitioner')
    this.riskSummaryView = new OasysRiskSummaryView(presenter.supplementaryRiskInformation, presenter.riskSummary)
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

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/riskInformationOasys',
      {
        riskInformation: this.riskSummaryView.riskInformation,
        latestAssessment: this.presenter.latestAssessment,
        roshPanelPresenter: this.presenter.riskPresenter,
        roshAnalysisTableArgs: this.riskView.roshAnalysisTableArgs.bind(this.riskView),
        editRiskConfirmationRadioButtonArgs: this.editRiskConfirmationRadioButtonArgs.bind(this),
        confirmUnderstoodWarningCheckboxArgs: this.confirmUnderstoodWarningCheckboxArgs,
        sensitiveInformationDetailsArgs: this.sensitiveInformationDetailsArgs,
      },
    ]
  }
}
