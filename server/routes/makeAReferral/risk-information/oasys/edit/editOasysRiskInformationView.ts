import { CheckboxesArgs, TextareaArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import { DraftOasysRiskInformation } from '../../../../../models/draftOasysRiskInformation'
import EditOasysRiskInformationPresenter from './editOasysRiskInformationPresenter'
import OasysRiskSummaryView from '../oasysRiskSummaryView'

export default class EditOasysRiskInformationView {
  riskSummaryView: OasysRiskSummaryView

  private readonly draftOasysRiskInformation: DraftOasysRiskInformation | null

  constructor(private readonly presenter: EditOasysRiskInformationPresenter) {
    this.riskSummaryView = new OasysRiskSummaryView(presenter.supplementaryRiskInformation, presenter.riskSummary)
    this.draftOasysRiskInformation = presenter.draftOasysRiskInformation
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errors.summary)

  private get whoIsAtRiskTextareaArgs(): TextareaArgs {
    const whoIsAtRisk = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.riskSummaryWhoIsAtRisk
      : this.riskSummaryView.riskInformation.summary.whoIsAtRisk.text
    return {
      name: 'who-is-at-risk',
      id: 'who-is-at-risk',
      label: {},
      value: ViewUtils.escape(whoIsAtRisk || ''),
    }
  }

  private get natureOfRiskTextareaArgs(): TextareaArgs {
    const natureOfRisk = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.riskSummaryNatureOfRisk
      : this.riskSummaryView.riskInformation.summary.natureOfRisk.text
    return {
      name: 'nature-of-risk',
      id: 'nature-of-risk',
      label: {},
      value: ViewUtils.escape(natureOfRisk || ''),
    }
  }

  private get riskImminenceTextareaArgs(): TextareaArgs {
    const riskImminence = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.riskSummaryRiskImminence
      : this.riskSummaryView.riskInformation.summary.riskImminence.text
    return {
      name: 'risk-imminence',
      id: 'risk-imminence',
      label: {},
      value: ViewUtils.escape(riskImminence || ''),
    }
  }

  private get riskToSelfSelfHarmTextareaArgs(): TextareaArgs {
    const selfHarm = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.riskToSelfSelfHarm
      : this.riskSummaryView.riskInformation.riskToSelf.selfHarm.text
    return {
      name: 'risk-to-self-self-harm',
      id: 'risk-to-self-self-harm',
      label: {},
      value: ViewUtils.escape(selfHarm || ''),
    }
  }

  private get riskToSelfSuicideTextareaArgs(): TextareaArgs {
    const suicide = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.riskToSelfSuicide
      : this.riskSummaryView.riskInformation.riskToSelf.suicide.text
    return {
      name: 'risk-to-self-suicide',
      id: 'risk-to-self-suicide',
      label: {},
      value: ViewUtils.escape(suicide || ''),
    }
  }

  private get riskToSelfHostelSettingTextareaArgs(): TextareaArgs {
    const hostelSetting = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.riskToSelfHostelSetting
      : this.riskSummaryView.riskInformation.riskToSelf.hostelSetting.text
    return {
      name: 'risk-to-self-hostel-setting',
      id: 'risk-to-self-hostel-setting',
      label: {},
      value: ViewUtils.escape(hostelSetting || ''),
    }
  }

  private get riskToSelfVulnerabilityTextareaArgs(): TextareaArgs {
    const vulnerability = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.riskToSelfVulnerability
      : this.riskSummaryView.riskInformation.riskToSelf.vulnerability.text
    return {
      name: 'risk-to-self-vulnerability',
      id: 'risk-to-self-vulnerability',
      label: {},
      value: ViewUtils.escape(vulnerability || ''),
    }
  }

  private get additionalInformationTextareaArgs(): TextareaArgs {
    const additionalInformation = this.draftOasysRiskInformation
      ? this.draftOasysRiskInformation.additionalInformation
      : this.riskSummaryView.riskInformation.additionalRiskInformation.text
    return {
      name: 'additional-information',
      id: 'additional-information',
      label: {},
      value: ViewUtils.escape(additionalInformation || ''),
    }
  }

  private get confirmUnderstoodWarningCheckboxArgs(): CheckboxesArgs {
    return {
      idPrefix: 'confirm-understood',
      name: 'confirm-understood',
      items: [
        {
          value: 'understood',
          text: 'I understand this information will be shared with the Service Provider',
        },
      ],
      classes: 'govuk-checkboxes__inset--grey',
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errors.confirmUnderstood),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/editRiskInformationOasys',
      {
        errorSummaryArgs: this.errorSummaryArgs,
        riskInformation: this.riskSummaryView.riskInformation,
        latestAssessment: this.presenter.latestAssessment,
        whoIsAtRiskTextareaArgs: this.whoIsAtRiskTextareaArgs,
        natureOfRiskTextareaArgs: this.natureOfRiskTextareaArgs,
        riskImminenceTextareaArgs: this.riskImminenceTextareaArgs,
        riskToSelfSelfHarmTextareaArgs: this.riskToSelfSelfHarmTextareaArgs,
        riskToSelfSuicideTextareaArgs: this.riskToSelfSuicideTextareaArgs,
        riskToSelfHostelSettingTextareaArgs: this.riskToSelfHostelSettingTextareaArgs,
        riskToSelfVulnerabilityTextareaArgs: this.riskToSelfVulnerabilityTextareaArgs,
        additionalInformationTextareaArgs: this.additionalInformationTextareaArgs,
        confirmUnderstoodWarningCheckboxArgs: this.confirmUnderstoodWarningCheckboxArgs,
      },
    ]
  }
}
