import FurtherInformationPresenter from './furtherInformationPresenter'

export default class FurtherInformationView {
  constructor(private readonly presenter: FurtherInformationPresenter) {}

  private get textAreaArgs(): Record<string, unknown> {
    const errorMessage = this.presenter.error ? { text: this.presenter.error.message } : null

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
          href: '#further-information',
        },
      ],
    }
  }

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
