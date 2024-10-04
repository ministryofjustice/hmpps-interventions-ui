import { Request } from 'express'
import {
  BackLinkArgs,
  DateInputArgs,
  RadiosArgs,
  SelectArgs,
  SelectArgsItem,
  TextareaArgs,
  TimeInputArgs,
} from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import ScheduleAppointmentPresenter from './scheduleAppointmentPresenter'
import AddressFormComponent from '../shared/addressFormComponent'

export default class ScheduleAppointmentView {
  constructor(
    readonly request: Request,
    private readonly serviceUserName: string,
    private readonly presenter: ScheduleAppointmentPresenter
  ) {}

  addressFormView = new AddressFormComponent(this.presenter.fields.address, 'method-other-location')

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
        classes: this.presenter.fields.time.partOfDay.hasError ? 'govuk-select--error' : 'govuk-select--time',
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

  private get deliusOfficeLocationSelectArgs(): SelectArgs {
    const items: SelectArgsItem[] = [
      {
        text: '-- Select a Probation Delivery Unit --',
        disabled: true,
      },
    ]
    items.push(...this.presenter.deliusOfficeLocationsDetails)
    return {
      id: 'delius-office-location-code',
      name: 'delius-office-location-code',
      items,
    }
  }

  private get sessionTypeRadioInputArgs(): RadiosArgs {
    return {
      idPrefix: 'session-type',
      name: 'session-type',
      fieldset: {
        legend: {
          text: 'Type of session',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.sessionType.errorMessage),
      hint: {
        text: 'Select one option',
      },
      items: [
        {
          value: 'ONE_TO_ONE',
          text: '1:1',
          checked: this.presenter.fields.sessionType.value === 'ONE_TO_ONE',
        },
        {
          value: 'GROUP',
          text: 'Group session',
          checked: this.presenter.fields.sessionType.value === 'GROUP',
        },
      ],
    }
  }

  private meetingMethodRadioInputArgs(deliusOfficeLocationHTML: string, otherLocationHTML: string): RadiosArgs {
    const items = []
    items.push({
      id: 'meeting-method-phone-call',
      value: 'PHONE_CALL',
      text: 'Phone call',
      checked: this.presenter.fields.meetingMethod.value === 'PHONE_CALL',
    })
    items.push({
      id: 'meeting-method-video-call',
      value: 'VIDEO_CALL',
      text: 'Video call',
      checked: this.presenter.fields.meetingMethod.value === 'VIDEO_CALL',
    })
    items.push({
      id: 'meeting-method-meeting-probation-office',
      value: 'IN_PERSON_MEETING_PROBATION_OFFICE',
      text: 'In-person meeting - NPS offices',
      checked: this.presenter.fields.meetingMethod.value === 'IN_PERSON_MEETING_PROBATION_OFFICE',
      conditional: {
        html: deliusOfficeLocationHTML,
      },
    })
    items.push({
      id: 'meeting-method-meeting-other',
      value: 'IN_PERSON_MEETING_OTHER',
      text: 'In-person meeting - Other locations',
      checked: this.presenter.fields.meetingMethod.value === 'IN_PERSON_MEETING_OTHER',
      conditional: {
        html: otherLocationHTML,
      },
    })
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
        text: 'Select one option',
      },
      items,
    }
  }

  private get rescheduleRequestedByRadioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'reschedule-requested-by',
      name: 'reschedule-requested-by',
      attributes: { 'data-cy': 'reschedule-requested-by-radios' },
      fieldset: {
        legend: {
          text: this.presenter.rescheduleRequestedBy.label,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Select one option',
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.rescheduleRequestedBy.errorMessage),
      items: [
        {
          id: 'rescheduleRequestedBySpRadio',
          value: 'Service Provider',
          text: 'Service Provider',
          checked: this.request.body['reschedule-requested-by'] === 'Service Provider',
        },
        {
          id: 'rescheduleRequestedByUserRadio',
          value: this.serviceUserName,
          text: this.serviceUserName,
          checked: this.request.body['reschedule-requested-by'] === this.serviceUserName,
        },
      ],
    }
  }

  private get rescheduledReasonTextareaArgs(): TextareaArgs {
    return {
      name: 'rescheduled-reason',
      id: 'rescheduled-reason',
      label: {
        text: this.presenter.rescheduledReason.label,
        classes: 'govuk-label--m',
      },
      value: this.presenter.fields.rescheduledReason,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.rescheduledReason.errorMessage),
    }
  }

  private get backLinkArgs(): BackLinkArgs {
    return {
      text: 'Back',
      href: this.presenter.backLinkHref,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/scheduleAppointment',
      {
        presenter: this.presenter,
        dateInputArgs: this.dateInputArgs,
        timeInputArgs: this.timeInputArgs,
        durationDateInputArgs: this.durationDateInputArgs,
        deliusOfficeLocationSelectArgs: this.deliusOfficeLocationSelectArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        serverError: this.serverError,
        address: this.addressFormView.inputArgs,
        sessionTypeRadioInputArgs: this.sessionTypeRadioInputArgs,
        rescheduleRequestedByRadioButtonArgs: this.rescheduleRequestedByRadioButtonArgs,
        rescheduledReasonTextareaArgs: this.rescheduledReasonTextareaArgs,
        meetingMethodRadioInputArgs: this.meetingMethodRadioInputArgs.bind(this),
        backLinkArgs: this.backLinkArgs,
        appointmentSummaryListArgs: ViewUtils.summaryListArgs(this.presenter.appointmentSummary),
      },
    ]
  }
}
