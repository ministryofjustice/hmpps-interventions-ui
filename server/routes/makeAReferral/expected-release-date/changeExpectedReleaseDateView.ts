import ViewUtils from '../../../utils/viewUtils'
import { DateInputArgs } from '../../../utils/govukFrontendTypes'
import ChangeExpectedReleaseDatePresenter from './changeExpectedReleaseDatePresenter'

export default class ChangeExpectedReleaseDateView {
  constructor(private readonly presenter: ChangeExpectedReleaseDatePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get dateInputArgs(): DateInputArgs {
    return {
      id: 'release-date',
      namePrefix: 'release-date',
      hint: {
        text: this.presenter.expectedReleaseDateHint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.releaseDate.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.fields.releaseDate.day.hasError ? ' govuk-input--error' : ''}`,
          name: 'day',
          value: this.presenter.fields.releaseDate.day.value,
        },
        {
          classes: `govuk-input--width-2${
            this.presenter.fields.releaseDate.month.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'month',
          value: this.presenter.fields.releaseDate.month.value,
        },
        {
          classes: `govuk-input--width-4${
            this.presenter.fields.releaseDate.year.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'year',
          value: this.presenter.fields.releaseDate.year.value,
        },
      ],
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/changeExpectedReleaseDate',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        dateInputArgs: this.dateInputArgs,
        suppressServiceUserBanner: true,
      },
    ]
  }
}
