import { AuthUser } from '../data/hmppsAuthClient'
import { ServiceUser } from '../services/interventionsService'
import CalendarDay from './calendarDay'
import utils from './utils'

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
