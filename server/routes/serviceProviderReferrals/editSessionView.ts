import { DateInputArgs, RadiosArgs, TimeInputArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import EditSessionPresenter from './editSessionPresenter'
import AddressFormComponent from '../shared/addressFormComponent'

export default class EditSessionView {
  constructor(private readonly presenter: EditSessionPresenter) {}

  addressFormView = new AddressFormComponent(this.presenter.fields.address, 'method-other-location')

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/editSession',
      {
        presenter: this.presenter,
        dateInputArgs: this.dateInputArgs,
        timeInputArgs: this.timeInputArgs,
        durationDateInputArgs: this.durationDateInputArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        serverError: this.serverError,
        address: this.addressFormView.inputArgs,
        meetingMethodRadioInputArgs: this.meetingMethodRadioInputArgs.bind(this),
      },
    ]
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get serverError(): { message: string; classes: string } | null {
    if (this.presenter.serverErrorMessage === null) {
      return null
    }

    return {
      message: this.presenter.serverErrorMessage,
      classes: 'govuk-form-group--error',
    }
  }

  get dateInputArgs(): DateInputArgs {
    return {
      id: 'date',
      namePrefix: 'date',
      fieldset: {
        legend: {
          text: 'Date',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.date.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.fields.date.day.hasError ? ' govuk-input--error' : ''}`,
          name: 'day',
          value: this.presenter.fields.date.day.value,
        },
        {
          classes: `govuk-input--width-2${this.presenter.fields.date.month.hasError ? ' govuk-input--error' : ''}`,
          name: 'month',
          value: this.presenter.fields.date.month.value,
        },
        {
          classes: `govuk-input--width-4${this.presenter.fields.date.year.hasError ? ' govuk-input--error' : ''}`,
          name: 'year',
          value: this.presenter.fields.date.year.value,
        },
      ],
    }
  }

  get timeInputArgs(): TimeInputArgs {
    return {
      id: 'time',
      namePrefix: 'time',
      fieldset: {
        legend: {
          text: 'Time',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.time.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.fields.time.hour.hasError ? ' govuk-input--error' : ''}`,
          name: 'hour',
          value: this.presenter.fields.time.hour.value,
        },
        {
          classes: `govuk-input--width-2${this.presenter.fields.time.minute.hasError ? ' govuk-input--error' : ''}`,
          name: 'minute',
          value: this.presenter.fields.time.minute.value,
        },
      ],
      select: {
        id: 'time-part-of-day',
        name: 'time-part-of-day',
        items: ['', 'am', 'pm'].map(value => ({
          text: value.toUpperCase(),
          value,
          selected: this.presenter.fields.time.partOfDay.value === value,
        })),
        label: {
          text: 'AM or PM',
        },
        classes: this.presenter.fields.time.partOfDay.hasError ? 'govuk-select--error' : '',
      },
    }
  }

  // The date input component appears to be flexible enough to allow us to
  // re-use it to display a duration instead.
  get durationDateInputArgs(): DateInputArgs {
    return {
      id: 'duration',
      namePrefix: 'duration',
      fieldset: {
        legend: {
          text: 'Duration of the session',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.duration.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.fields.duration.hours.hasError ? ' govuk-input--error' : ''}`,
          name: 'hours',
          value: this.presenter.fields.duration.hours.value,
        },
        {
          classes: `govuk-input--width-2${
            this.presenter.fields.duration.minutes.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'minutes',
          value: this.presenter.fields.duration.minutes.value,
        },
      ],
    }
  }

  private meetingMethodRadioInputArgs(otherLocationHTML: string): RadiosArgs {
    return {
      idPrefix: 'meeting-method',
      name: 'meeting-method',
      fieldset: {
        legend: {
          text: 'Method',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.meetingMethod.errorMessage),
      hint: {
        text: 'Select one option.',
      },
      items: [
        {
          value: 'PHONE_CALL',
          text: 'Phone call',
          checked: this.presenter.fields.meetingMethod.value === 'PHONE_CALL',
        },
        {
          value: 'VIDEO_CALL',
          text: 'Video call',
          checked: this.presenter.fields.meetingMethod.value === 'VIDEO_CALL',
        },
        {
          value: 'IN_PERSON_MEETING_OTHER',
          text: 'In-person meeting',
          checked: this.presenter.fields.meetingMethod.value === 'IN_PERSON_MEETING_OTHER',
          conditional: {
            html: otherLocationHTML,
          },
        },
      ],
    }
  }
}
