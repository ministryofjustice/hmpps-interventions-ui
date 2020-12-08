export default class CalendarDay {
  private constructor(readonly day: number, readonly month: number, readonly year: number) {}

  static fromComponents(day: number, month: number, year: number): CalendarDay | null {
    return isValidDate(day, month, year) ? new CalendarDay(day, month, year) : null
  }

  static parseIso8601(val: string): CalendarDay | null {
    const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val)

    if (result === null) {
      return null
    }

    const [year, month, day] = result.slice(1).map(Number)

    if (!isValidDate(day, month, year)) {
      return null
    }

    return new CalendarDay(day, month, year)
  }

  get iso8601(): string {
    return [
      String(this.year).padStart(4, '0'),
      String(this.month).padStart(2, '0'),
      String(this.day).padStart(2, '0'),
    ].join('-')
  }
}

function isValidDate(day: number, month: number, year: number) {
  // Date(Date.UTC(…)) will always return a valid date regardless of input, so if
  // [day, month, year] aren’t the components of a valid date then they won’t
  // match the components of this result.
  const date = new Date(Date.UTC(year, month - 1, day))
  return year === date.getUTCFullYear() && month === date.getUTCMonth() + 1 && day === date.getUTCDate()
}
