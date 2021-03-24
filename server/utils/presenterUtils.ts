import { AuthUser } from '../data/hmppsAuthClient'
import { ServiceUser } from '../services/interventionsService'
import CalendarDay from './calendarDay'
import { FormValidationError } from './formValidationError'
import utils from './utils'

interface DateComponentInputPresenter {
  value: string
  hasError: boolean
}

export interface DateInputPresenter {
  errorMessage: string | null
  day: DateComponentInputPresenter
  month: DateComponentInputPresenter
  year: DateComponentInputPresenter
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

  static fullName(user: ServiceUser | AuthUser): string {
    return utils.convertToTitleCase(`${user.firstName ?? ''} ${user.lastName ?? ''}`)
  }

  static fullNameSortValue(serviceUser: ServiceUser): string {
    return `${serviceUser.lastName ?? ''}, ${serviceUser.firstName ?? ''}`.toLocaleLowerCase('en-GB')
  }

  static govukFormattedDateFromStringOrNull(date: string | null): string {
    const notFoundMessage = 'Not found'

    if (date) {
      const iso8601date = CalendarDay.parseIso8601(date)

      return iso8601date ? this.govukFormattedDate(iso8601date) : notFoundMessage
    }

    return notFoundMessage
  }
}
