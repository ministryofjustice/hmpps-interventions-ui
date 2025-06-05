import { Request } from 'express'
import AmendExpectedReleaseDatePresenter from './amendExpectedReleaseDatePresenter'
import ViewUtils from '../../../utils/viewUtils'
import { DateInputArgs, RadiosArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'

export default class AmendExpectedReleaseDateView {
  constructor(
    private readonly presenter: AmendExpectedReleaseDatePresenter,
    private readonly request: Request
  ) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private expectedReleaseDateRadioArgs(
    enterExpectedReleaseDateHTML: string,
    enterReasonWhyDateNotKnownHTML: string
  ): RadiosArgs {
    return {
      idPrefix: 'release-date',
      name: 'release-date',
      items: [
        {
          value: 'confirm',
          text: `Enter a different date`,
          checked: this.request.body?.['release-date'] === 'confirm',
          conditional: {
            html: enterExpectedReleaseDateHTML,
          },
        },
        {
          value: 'change',
          text: `I don't know the expected release date`,
          checked: this.request.body?.['release-date'] === 'change',
          conditional: {
            html: enterReasonWhyDateNotKnownHTML,
          },
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.location.errorMessage),
    }
  }

  private get dateInputArgs(): DateInputArgs {
    return {
      id: 'amend-expected-release-date',
      namePrefix: 'amend-expected-release-date',
      hint: {
        text: this.presenter.expectedReleaseDateHint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.expectedReleaseDate.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${
            this.presenter.fields.expectedReleaseDate.day.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'day',
          value: this.presenter.fields.expectedReleaseDate.day.value,
        },
        {
          classes: `govuk-input--width-2${
            this.presenter.fields.expectedReleaseDate.month.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'month',
          value: this.presenter.fields.expectedReleaseDate.month.value,
        },
        {
          classes: `govuk-input--width-4${
            this.presenter.fields.expectedReleaseDate.year.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'year',
          value: this.presenter.fields.expectedReleaseDate.year.value,
        },
      ],
    }
  }

  private get expectedReleaseDateUnknownReasonInputArgs(): TextareaArgs {
    return {
      name: 'amend-date-unknown-reason',
      id: 'amend-date-unknown-reason',
      label: {
        text: this.presenter.text.reasonForChangeHeading,
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      rows: '5',
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.reasonForChangeErrorMessage),
      value: this.presenter.fields.expectedReleaseDateUnknownReason,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/expectedReleaseDate',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        expectedReleaseDateUnknownReasonInputArgs: this.expectedReleaseDateUnknownReasonInputArgs,
        dateInputArgs: this.dateInputArgs,
        expectedReleaseDateRadioArgs: this.expectedReleaseDateRadioArgs.bind(this),
        suppressServiceUserBanner: true,
      },
    ]
  }
}
