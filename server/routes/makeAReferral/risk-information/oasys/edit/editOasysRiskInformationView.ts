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
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.summary.whoIsAtRisk.text || ''
    const whoIsAtRisk = this.draftOasysRiskInformation?.riskSummaryWhoIsAtRisk || oasysRiskInfoText
    return {
      name: 'who-is-at-risk',
      id: 'who-is-at-risk',
      label: {},
      value: ViewUtils.escape(whoIsAtRisk || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
    }
  }

  private get natureOfRiskTextareaArgs(): TextareaArgs {
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.summary.natureOfRisk.text || ''
    const natureOfRisk = this.draftOasysRiskInformation?.riskSummaryNatureOfRisk || oasysRiskInfoText
    return {
      name: 'nature-of-risk',
      id: 'nature-of-risk',
      label: {},
      value: ViewUtils.escape(natureOfRisk || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
    }
  }

  private get riskImminenceTextareaArgs(): TextareaArgs {
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.summary.riskImminence.text || ''
    const riskImminence = this.draftOasysRiskInformation?.riskSummaryRiskImminence || oasysRiskInfoText
    return {
      name: 'risk-imminence',
      id: 'risk-imminence',
      label: {},
      value: ViewUtils.escape(riskImminence || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
    }
  }

  private get riskToSelfSelfHarmTextareaArgs(): TextareaArgs {
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.riskToSelf.selfHarm.text || ''
    const selfHarm = this.draftOasysRiskInformation?.riskToSelfSelfHarm || oasysRiskInfoText
    return {
      name: 'risk-to-self-self-harm',
      id: 'risk-to-self-self-harm',
      label: {},
      value: ViewUtils.escape(selfHarm || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
    }
  }

  private get riskToSelfSuicideTextareaArgs(): TextareaArgs {
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.riskToSelf.suicide.text || ''
    const suicide = this.draftOasysRiskInformation?.riskToSelfSuicide || oasysRiskInfoText
    return {
      name: 'risk-to-self-suicide',
      id: 'risk-to-self-suicide',
      label: {},
      value: ViewUtils.escape(suicide || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
    }
  }

  private get riskToSelfHostelSettingTextareaArgs(): TextareaArgs {
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.riskToSelf.hostelSetting.text || ''
    const hostelSetting = this.draftOasysRiskInformation?.riskToSelfHostelSetting || oasysRiskInfoText
    return {
      name: 'risk-to-self-hostel-setting',
      id: 'risk-to-self-hostel-setting',
      label: {},
      value: ViewUtils.escape(hostelSetting || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
    }
  }

  private get riskToSelfVulnerabilityTextareaArgs(): TextareaArgs {
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.riskToSelf.vulnerability.text || ''
    const vulnerability = this.draftOasysRiskInformation?.riskToSelfVulnerability || oasysRiskInfoText
    return {
      name: 'risk-to-self-vulnerability',
      id: 'risk-to-self-vulnerability',
      label: {},
      value: ViewUtils.escape(vulnerability || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
    }
  }

  private get additionalInformationTextareaArgs(): TextareaArgs {
    const oasysRiskInfoText = this.riskSummaryView.oasysRiskInformationArgs.additionalRiskInformation.text || ''
    const additionalInformation = this.draftOasysRiskInformation?.additionalInformation || oasysRiskInfoText
    return {
      name: 'additional-information',
      id: 'additional-information',
      label: {},
      value: ViewUtils.escape(additionalInformation || ''),
      attributes: {
        oasysRiskInfo: ViewUtils.escape(oasysRiskInfoText),
      },
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
        riskInformation: this.riskSummaryView.oasysRiskInformationArgs,
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
