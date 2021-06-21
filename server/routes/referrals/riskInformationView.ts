import RiskInformationPresenter from './riskInformationPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TableArgs, TagArgs, TextareaArgs } from '../../utils/govukFrontendTypes'
import utils from '../../utils/utils'

export default class RiskInformationView {
  constructor(private readonly presenter: RiskInformationPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get additionalRiskInformationTextareaArgs(): TextareaArgs {
    return {
      name: 'additional-risk-information',
      id: 'additional-risk-information',
      label: {
        text: this.presenter.text.additionalRiskInformation.label,
        classes: 'govuk-label--s',
      },
      value: this.presenter.fields.additionalRiskInformation,
      hint: {
        text: 'Provide relevant risk information to share with the service provider.',
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.additionalRiskInformation.errorMessage),
    }
  }

  roshAnalysisTableArgs(tagMacro: (args: TagArgs) => string): TableArgs {
    return {
      head: this.presenter.roshAnalysisHeaders.map((header: string) => {
        return { text: header }
      }),
      rows: this.presenter.roshAnalysisRows.map(row => {
        return [
          { text: utils.convertToProperCase(row.riskTo) },
          { text: tagMacro({ text: row.riskScore, classes: this.tagClassForRiskScore(row.riskScore) }) },
        ]
      }),
    }
  }

  private tagClassForRiskScore(riskScore: string): string {
    switch (riskScore) {
      case 'LOW':
        return 'govuk-tag--green'
      case 'MEDIUM':
        return 'govuk-tag--blue'
      case 'HIGH':
        return 'govuk-tag--red'
      case 'VERY_HIGH':
        return 'govuk-tag--purple'
      default:
        return ''
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/riskInformation',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        additionalRiskInformationTextareaArgs: this.additionalRiskInformationTextareaArgs,
        roshAnalysisTableArgs: this.roshAnalysisTableArgs.bind(this),
      },
    ]
  }
}
