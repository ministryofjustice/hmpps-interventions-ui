import RiskInformationPresenter from './riskInformationPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TextareaArgs } from '../../utils/govukFrontendTypes'

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
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.additionalRiskInformation.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/riskInformation',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        additionalRiskInformationTextareaArgs: this.additionalRiskInformationTextareaArgs,
      },
    ]
  }
}
