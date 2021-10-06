import ComplexityLevelPresenter from './complexityLevelPresenter'
import ViewUtils from '../../../../utils/viewUtils'
import { RadiosArgs } from '../../../../utils/govukFrontendTypes'

export default class ComplexityLevelView {
  constructor(readonly presenter: ComplexityLevelPresenter) {}

  get radioButtonArgs(): RadiosArgs {
    return {
      classes: 'govuk-radios',
      idPrefix: 'complexity-level-id',
      name: 'complexity-level-id',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      items: this.presenter.complexityDescriptions.map(complexityDescription => {
        return {
          value: complexityDescription.value,
          text: complexityDescription.title,
          hint: {
            text: complexityDescription.hint,
          },
          checked: complexityDescription.checked,
        }
      }),
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/complexityLevel',
      {
        presenter: this.presenter,
        radioButtonArgs: this.radioButtonArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}
