import RiskInformationPresenter from './riskInformationPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class RiskInformationView {
  constructor(private readonly presenter: RiskInformationPresenter) {}

  private get errorSummaryArgs() {
    if (!this.presenter.errorSummary) {
      return null
    }

    return {
      titleText: 'There is a problem',
      errorList: this.presenter.errorSummary.map(error => ({ text: error.message, href: `#${error.field}` })),
    }
  }

  private get summaryListArgs() {
    return {
      rows: this.presenter.summary.map(item => {
        return {
          key: { text: item.key },
          value: { text: item.text },
        }
      }),
    }
  }

  private get additionalRiskInformationTextareaArgs() {
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
        summaryListArgs: this.summaryListArgs,
        additionalRiskInformationTextareaArgs: this.additionalRiskInformationTextareaArgs,
      },
    ]
  }
}
