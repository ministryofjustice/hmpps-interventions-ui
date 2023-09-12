import ExpectedReleaseDatePresenter from './expectedReleaseDatePresenter'
import ViewUtils from '../../../utils/viewUtils'
import { DateInputArgs, RadiosArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'

export default class ExpectedReleaseDateView {
  constructor(private readonly presenter: ExpectedReleaseDatePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private expectedReleaseDateRadioArgs(yesHtml: string, noHtml: string): RadiosArgs {
    return {
      idPrefix: 'expected-release-date',
      name: 'expected-release-date',
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.presenter.fields.hasExpectedReleaseDate === true,
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: 'no',
          text: 'No',
          checked: this.presenter.fields.hasExpectedReleaseDate === false,
          conditional: {
            html: noHtml,
          },
        },
      ],
    }
  }

  private get dateInputArgs(): DateInputArgs {
    return {
      id: 'release-date',
      namePrefix: 'release-date',
      fieldset: {
        legend: {
          text: this.presenter.text.releaseDate.label,
        },
      },
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

  private get releaseDateUnknownReasonArgs(): TextareaArgs {
    return {
      id: 'release-date-unknown-reason',
      name: 'release-date-unknown-reason',
      label: {
        text: this.presenter.text.releaseDateUnknownReason.label,
      },
      value: this.presenter.fields.releaseDateUnknownReason,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.releaseDateUnknownReason.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/expectedReleaseDate',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        expectedReleaseDateRadioArgs: this.expectedReleaseDateRadioArgs.bind(this),
        releaseDateUnknownReasonArgs: this.releaseDateUnknownReasonArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        dateInputArgs: this.dateInputArgs,
        suppressServiceUserBanner: true,
      },
    ]
  }
}
