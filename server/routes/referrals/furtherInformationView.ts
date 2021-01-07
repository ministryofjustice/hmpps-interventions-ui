import ViewUtils from '../../utils/viewUtils'
import FurtherInformationPresenter from './furtherInformationPresenter'

export default class FurtherInformationView {
  constructor(private readonly presenter: FurtherInformationPresenter) {}

  private get textAreaArgs(): Record<string, unknown> {
    const errorMessage = this.presenter.errorMessage ? { text: this.presenter.errorMessage } : null

    return {
      name: 'further-information',
      id: 'further-information',
      label: {
        text: this.presenter.title,
        classes: 'govuk-label--xl',
        isPageHeading: true,
      },
      errorMessage,
      hint: {
        text: this.presenter.hint,
      },
      value: this.presenter.value,
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/furtherInformation',
      {
        presenter: this.presenter,
        textAreaArgs: this.textAreaArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}
