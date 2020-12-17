import ComplexityLevelPresenter from './complexityLevelPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class ComplexityLevelView {
  constructor(readonly presenter: ComplexityLevelPresenter) {}

  get radioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'complexity-level',
      name: 'complexity-level-id',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.error?.message),
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

  get errorSummaryArgs(): Record<string, unknown> | null {
    if (!this.presenter.error) {
      return null
    }

    return {
      titleText: 'There is a problem',
      errorList: [
        {
          text: this.presenter.error.message,
          href: '#complexity-level',
        },
      ],
    }
  }

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
