import { DraftReferral } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import utils from '../../utils/utils'

// This way of extracting all of a type’s properties of a particular type is taken from
// https://stackoverflow.com/questions/56558289/typescript-generic-type-restriction-on-return-value-of-keyof
type PropertiesOfType<TObj, TResult> = { [K in keyof TObj]: TObj[K] extends TResult ? K : never }[keyof TObj]

export default class ReferralDataPresenterUtils {
  constructor(
    private readonly referral: DraftReferral,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  stringValue<K extends PropertiesOfType<DraftReferral, string | number | null>>(
    referralKey: K,
    userInputKey: string
  ): string {
    if (this.userInputData === null) {
      return String(this.referral[referralKey] ?? '')
    }
    return String(this.userInputData[userInputKey] ?? '')
  }

  booleanValue<K extends PropertiesOfType<DraftReferral, boolean | null>>(
    referralKey: K,
    userInputKey: string
  ): boolean | null {
    if (this.userInputData === null) {
      return this.referral[referralKey]
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
}
