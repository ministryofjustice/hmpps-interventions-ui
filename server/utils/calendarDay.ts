export default class CalendarDay {
  private constructor(readonly day: number, readonly month: number, readonly year: number) {}

  static fromComponents(day: number, month: number, year: number): CalendarDay | null {
    return this.isValid(day, month, year) ? new CalendarDay(day, month, year) : null
  }

  private static isValid(day: number, month: number, year: number): boolean {
    // Date(Date.UTC(…)) will always return a valid date regardless of input, so if
    // [day, month, year] aren’t the components of a valid date then they won’t
    // match the components of this result.
    const date = new Date(Date.UTC(year, month - 1, day))
    return year === date.getUTCFullYear() && month === date.getUTCMonth() + 1 && day === date.getUTCDate()
  }

  static parseIso8601(val: string): CalendarDay | null {
    const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val)

    if (result === null) {
      return null
    }

    const [year, month, day] = result.slice(1).map(Number)

    return CalendarDay.fromComponents(day, month, year)
  }

  private static dayForDate(date: Date, ianaTimeZoneIdentifier: string): CalendarDay {
    /*
    It seems that JavaScript only exposes time zone conversion functionality
    through its date formatting methods.

    So, to find the day / month / year components of a Date in a given time zone,
    we format the date in that time zone and then extract the formatted components.
    */

    const format = Intl.DateTimeFormat('en-US', { timeZone: ianaTimeZoneIdentifier })

    const parts = format.formatToParts(date)
    const componentStrings = ['day', 'month', 'year'].map(
      component => parts.find(part => part.type === component)?.value
    )
    const components = componentStrings.map(componentString => {
      if (componentString === undefined) {
        throw new Error('Failed to extract component from date')
      }

      return Number.parseInt(componentString, 10)
    })

    return new CalendarDay(components[0], components[1], components[2])
  }

  static britishDayForDate(date: Date): CalendarDay {
    return this.dayForDate(date, 'Europe/London')
  }

  get iso8601(): string {
    return [
      String(this.year).padStart(4, '0'),
      String(this.month).padStart(2, '0'),
      String(this.day).padStart(2, '0'),
    ].join('-')
  }

  get utcDate(): Date {
    return new Date(Date.UTC(this.year, this.month - 1, this.day))
  }
}
