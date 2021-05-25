import ServiceUser from '../models/serviceUser'
import CalendarDay from './calendarDay'
import ClockTime from './clockTime'
import { FormValidationError } from './formValidationError'
import Duration from './duration'
import utils from './utils'
import AuthUserDetails from '../models/hmppsAuth/authUserDetails'
import ComplexityLevel from '../models/complexityLevel'
import { TagArgs } from './govukFrontendTypes'

interface DateTimeComponentInputPresenter {
  value: string
  hasError: boolean
}

export interface DateInputPresenter {
  errorMessage: string | null
  day: DateTimeComponentInputPresenter
  month: DateTimeComponentInputPresenter
  year: DateTimeComponentInputPresenter
}

interface DurationInputPresenter {
  errorMessage: string | null
  hours: DateTimeComponentInputPresenter
  minutes: DateTimeComponentInputPresenter
}

interface PartOfDayInputPresenter {
  value: 'am' | 'pm' | null
  hasError: boolean
}

interface TwelveHourTimeInputPresenter {
  errorMessage: string | null
  hour: DateTimeComponentInputPresenter
  minute: DateTimeComponentInputPresenter
  partOfDay: PartOfDayInputPresenter
}

export default class PresenterUtils {
  constructor(private readonly userInputData: Record<string, unknown> | null = null) {}

  stringValue(modelValue: string | number | null, userInputKey: string): string {
    if (this.userInputData === null) {
      return String(modelValue ?? '')
    }
    return String(this.userInputData[userInputKey] ?? '')
  }

  booleanValue(modelValue: boolean | null, userInputKey: string): boolean | null {
    if (this.userInputData === null) {
      return modelValue
    }
    if (this.userInputData[userInputKey] === 'yes') {
      return true
    }
    if (this.userInputData[userInputKey] === 'no') {
      return false
    }
    return null
  }

  dateValue(
    modelValue: CalendarDay | null,
    userInputKey: string,
    error: FormValidationError | null
  ): DateInputPresenter {
    const [dayKey, monthKey, yearKey] = ['day', 'month', 'year'].map(suffix => `${userInputKey}-${suffix}`)

    const errorMessage =
      PresenterUtils.errorMessage(error, dayKey) ??
      PresenterUtils.errorMessage(error, monthKey) ??
      PresenterUtils.errorMessage(error, yearKey)

    let dayValue = ''
    let monthValue = ''
    let yearValue = ''

    if (this.userInputData === null) {
      if (modelValue !== null) {
        dayValue = String(modelValue?.day ?? '')
        monthValue = String(modelValue?.month ?? '')
        yearValue = String(modelValue?.year ?? '')
      }
    } else {
      dayValue = String(this.userInputData[dayKey] || '')
      monthValue = String(this.userInputData[monthKey] || '')
      yearValue = String(this.userInputData[yearKey] || '')
    }

    return {
      errorMessage,
      day: {
        value: dayValue,
        hasError: PresenterUtils.hasError(error, dayKey),
      },
      month: {
        value: monthValue,
        hasError: PresenterUtils.hasError(error, monthKey),
      },
      year: {
        value: yearValue,
        hasError: PresenterUtils.hasError(error, yearKey),
      },
    }
  }

  durationValue(
    modelValue: Duration | null,
    userInputKey: string,
    error: FormValidationError | null
  ): DurationInputPresenter {
    const [hoursKey, minutesKey] = ['hours', 'minutes'].map(suffix => `${userInputKey}-${suffix}`)

    const errorMessage = PresenterUtils.errorMessage(error, hoursKey) ?? PresenterUtils.errorMessage(error, minutesKey)

    let hoursValue = ''
    let minutesValue = ''

    if (this.userInputData === null) {
      if (modelValue !== null) {
        hoursValue = String(modelValue?.stopwatchHours ?? '')
        minutesValue = String(modelValue?.stopwatchMinutes ?? '')
      }
    } else {
      hoursValue = String(this.userInputData[hoursKey] || '')
      minutesValue = String(this.userInputData[minutesKey] || '')
    }

    return {
      errorMessage,
      hours: {
        value: hoursValue,
        hasError: PresenterUtils.hasError(error, hoursKey),
      },
      minutes: {
        value: minutesValue,
        hasError: PresenterUtils.hasError(error, minutesKey),
      },
    }
  }

  twelveHourTimeValue(
    modelValue: ClockTime | null,
    userInputKey: string,
    error: FormValidationError | null
  ): TwelveHourTimeInputPresenter {
    const [hourKey, minuteKey, partOfDayKey] = ['hour', 'minute', 'part-of-day'].map(
      suffix => `${userInputKey}-${suffix}`
    )

    const errorMessage =
      PresenterUtils.errorMessage(error, hourKey) ??
      PresenterUtils.errorMessage(error, minuteKey) ??
      PresenterUtils.errorMessage(error, partOfDayKey)

    let hourValue = ''
    let minuteValue = ''
    let partOfDayValue: 'am' | 'pm' | null = null

    if (this.userInputData === null) {
      if (modelValue !== null) {
        hourValue = String(modelValue?.twelveHourClockHour ?? '')
        minuteValue = modelValue ? String(modelValue.minute).padStart(2, '0') : ''
        partOfDayValue = modelValue?.partOfDay ?? null
      }
    } else {
      hourValue = String(this.userInputData[hourKey] || '')
      minuteValue = String(this.userInputData[minuteKey] || '')

      if (this.userInputData[partOfDayKey] === 'am' || this.userInputData[partOfDayKey] === 'pm') {
        partOfDayValue = this.userInputData[partOfDayKey] as 'am' | 'pm'
      } else {
        partOfDayValue = null
      }
    }

    return {
      errorMessage,
      partOfDay: {
        value: partOfDayValue,
        hasError: PresenterUtils.hasError(error, partOfDayKey),
      },
      hour: {
        value: hourValue,
        hasError: PresenterUtils.hasError(error, hourKey),
      },
      minute: {
        value: minuteValue,
        hasError: PresenterUtils.hasError(error, minuteKey),
      },
    }
  }

  private static sortedErrors<T extends { errorSummaryLinkedField: string }>(errors: T[], fieldOrder: string[]): T[] {
    const copiedErrors = errors.slice()
    return copiedErrors.sort((a, b) => {
      const [aIndex, bIndex] = [
        fieldOrder.indexOf(a.errorSummaryLinkedField),
        fieldOrder.indexOf(b.errorSummaryLinkedField),
      ]
      if (aIndex === -1) {
        return 1
      }
      if (bIndex === -1) {
        return -1
      }

      return aIndex - bIndex
    })
  }

  static errorSummary(
    error: { errors: { errorSummaryLinkedField: string; message: string }[] } | null,
    options: { fieldOrder: string[] } = { fieldOrder: [] }
  ): { field: string; message: string }[] | null {
    if (error === null) {
      return null
    }

    const sortedErrors = this.sortedErrors(error.errors, options.fieldOrder)

    return sortedErrors.map(subError => {
      return { field: subError.errorSummaryLinkedField, message: subError.message }
    })
  }

  static errorMessage(
    error: { errors: { formFields: string[]; message: string }[] } | null,
    field: string
  ): string | null {
    if (error === null) {
      return null
    }

    const errorForField = error.errors.find(subError => subError.formFields.includes(field))

    return errorForField?.message ?? null
  }

  static hasError(error: { errors: { formFields: string[]; message: string }[] } | null, field: string): boolean {
    if (error === null) {
      return false
    }

    return !!error.errors.find(subError => subError.formFields.includes(field))
  }

  // https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#dates
  static govukFormattedDate(day: CalendarDay): string {
    const format = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    const date = day.utcDate

    return format.format(date)
  }

  static govukShortFormattedDate(day: CalendarDay): string {
    const format = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    const date = day.utcDate

    return format.format(date)
  }

  static fullName(user: ServiceUser | AuthUserDetails): string {
    return utils.convertToTitleCase(`${user.firstName ?? ''} ${user.lastName ?? ''}`)
  }

  static fullNameSortValue(serviceUser: ServiceUser): string {
    return `${serviceUser.lastName ?? ''}, ${serviceUser.firstName ?? ''}`.toLocaleLowerCase('en-GB')
  }

  static govukFormattedDateFromStringOrNull(date: string | null): string {
    const notFoundMessage = 'Not found'

    if (date) {
      const iso8601date = CalendarDay.parseIso8601Date(date)

      return iso8601date ? this.govukFormattedDate(iso8601date) : notFoundMessage
    }

    return notFoundMessage
  }

  static complexityLevelTagArgs(complexityLevel: ComplexityLevel): TagArgs {
    const title = complexityLevel.title.toUpperCase()

    if (title.includes('LOW')) {
      return {
        text: title,
        classes: 'govuk-tag--green',
      }
    }

    if (title.includes('MEDIUM')) {
      return {
        text: title,
        classes: 'govuk-tag--blue',
      }
    }

    if (title.includes('HIGH')) {
      return {
        text: title,
        classes: 'govuk-tag--red',
      }
    }

    return {
      text: 'UNKNOWN',
      classes: 'govuk-tag--grey',
    }
  }
}
