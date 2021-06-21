import RiskInformationPresenter from './riskInformationPresenter'
import ViewUtils from '../../utils/viewUtils'
import { DetailsArgs, TableArgs, TagArgs, TextareaArgs } from '../../utils/govukFrontendTypes'
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
        classes: this.presenter.text.additionalRiskInformation.labelClasses,
      },
      value: this.presenter.fields.additionalRiskInformation,
      hint: {
        text: this.presenter.text.additionalRiskInformation.hint,
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

  get riskLevelDetailsArgs(): DetailsArgs {
    return {
      summaryText: 'Definitions of risk levels',
      html: `
            <ul class="govuk-list govuk-list--bullet">
              <li>
                <strong>Low</strong> - Current evidence does not indicate likelihood of causing serious harm.
              </li>
              <li>
                <strong>Medium</strong> - There are identifiable indicators of risk of serious harm. The person has the potential to cause serious harm but is unlikely to do so unless there is a change in circumstances.
              </li>
              <li>
                <strong>High</strong> - There are identifiable indicators of risk of serious harm. The potential event could happen at any time and the impact would be serious.
              </li>
              <li>
                <strong>Very high</strong> - There is an imminent risk of serious harm. The potential event is more likely than not to happen imminently and the impact would be serious.
              </li>
            </ul>`,
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
        riskLevelDetailsArgs: this.riskLevelDetailsArgs,
      },
    ]
  }
}
