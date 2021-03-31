type PartOfDay = 'am' | 'pm'

export default class ClockTime {
  /*
   * 0 ≤ hour ≤ 23
   * 0 ≤ minute ≤ 59
   * 0 ≤ second ≤ 59
   */
  private constructor(readonly hour: number, readonly minute: number, readonly second: number) {}

  static fromComponents(hour: number, minute: number, second: number): ClockTime | null {
    return ClockTime.isValid(hour, minute, second) ? new ClockTime(hour, minute, second) : null
  }

  static fromTwelveHourComponents(
    twelveHourClockHour: number,
    minute: number,
    second: number,
    partOfDay: PartOfDay
  ): ClockTime | null {
    if (twelveHourClockHour < (partOfDay === 'pm' ? 1 : 0) || twelveHourClockHour > (partOfDay === 'am' ? 11 : 12)) {
      return null
    }

    const hour = partOfDay === 'pm' && twelveHourClockHour < 12 ? twelveHourClockHour + 12 : twelveHourClockHour

    return this.fromComponents(hour, minute, second)
  }

  static isValid(hour: number, minute: number, second: number): boolean {
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59
  }

  private static timeForDate(date: Date, ianaTimeZoneIdentifier: string): ClockTime {
    /*
    We take the same approach here as in CalendarDay.dayForDate; see the comment 
    there.
    */

    const format = Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimeZoneIdentifier,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    })

    const parts = format.formatToParts(date)
    const componentStrings = ['hour', 'minute', 'second'].map(
      component => parts.find(part => part.type === component)?.value
    )
    const components = componentStrings.map(componentString => {
      if (componentString === undefined) {
        throw new Error('Failed to extract component from date')
      }

      return Number.parseInt(componentString, 10)
    })

    if (components[0] === 24) {
      // I don’t know why midnight gets formatted as 24 hours, but let’s normalise it
      components[0] = 0
    }

    return new ClockTime(components[0], components[1], components[2])
  }

  static britishTimeForDate(date: Date): ClockTime {
    return this.timeForDate(date, 'Europe/London')
  }

  get twelveHourClockHour(): number {
    return this.hour > 12 ? this.hour % 12 : this.hour
  }

  get partOfDay(): PartOfDay {
    return this.hour < 12 ? 'am' : 'pm'
  }
}
