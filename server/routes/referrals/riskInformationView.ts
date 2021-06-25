import RiskInformationPresenter from './riskInformationPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TextareaArgs } from '../../utils/govukFrontendTypes'
import RiskView from '../shared/riskView'

export default class RiskInformationView {
  constructor(private readonly presenter: RiskInformationPresenter) {}

  private riskView = new RiskView(this.presenter.riskPresenter, 'probation-practitioner')

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get additionalRiskInformationTextareaArgs(): TextareaArgs {
    return {
      name: 'additional-risk-information',
      id: 'additional-risk-information',
      label: {
        text: this.presenter.additionalRiskInformation.label,
        classes: 'govuk-label--l',
      },
      value: this.presenter.fields.additionalRiskInformation,
      hint: {
        text: this.presenter.additionalRiskInformation.hint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.additionalRiskInformation.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/riskInformation',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        additionalRiskInformationTextareaArgs: this.additionalRiskInformationTextareaArgs,
        roshAnalysisTableArgs: this.riskView.roshAnalysisTableArgs.bind(this.riskView),
        riskLevelDetailsArgs: this.riskView.riskLevelDetailsArgs,
      },
    ]
  }
}
