import ClockTime from './clockTime'
import CalendarDay from './calendarDay'

export default class DateUtils {
  // example output: 1:00pm on 12 April 2021
  static formattedDateTime(dateTime: Date | string, options: { month: 'short' | 'long' } = { month: 'long' }): string {
    return `${this.formattedTime(dateTime)} on ${this.formattedDate(dateTime, options)}`
  }

  // Docs: https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#dates
  // string input: 2021-06-02 from delius (i.e. serviceUser.dateOfBirth)
  // string input: 2021-06-02T00:30:00+01:00 from interventions
  // example output: 12 January 2021
  static formattedDate(
    date: CalendarDay | Date | string,
    options: { month: 'short' | 'long' } = { month: 'long' }
  ): string {
    let calendarDay: CalendarDay
    if (date instanceof CalendarDay) {
      calendarDay = date
    } else if (date instanceof Date) {
      calendarDay = CalendarDay.britishDayForDate(date)
    } else {
      calendarDay = CalendarDay.britishDayForDate(new Date(date))!
    }
    const format = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: options.month,
      year: 'numeric',
      timeZone: 'UTC',
    })
    return format.format(calendarDay.utcDate)
  }

  // Docs: https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#times
  // string input: 2021-06-02T00:30:00+01:00 or 2021-06-02T00:30:00
  // example output: 1:00pm
  static formattedTime(time: ClockTime | Date | string): string {
    let clockTime: ClockTime
    if (time instanceof ClockTime) {
      clockTime = time
    } else if (time instanceof CalendarDay) {
      clockTime = ClockTime.britishTimeForDate(time.utcDate)
    } else if (time instanceof Date) {
      clockTime = ClockTime.britishTimeForDate(time)
    } else {
      clockTime = ClockTime.britishTimeForDate(new Date(time))
    }
    if (clockTime.twelveHourClockHour === 12 && clockTime.minute === 0 && clockTime.partOfDay === 'pm') {
      return 'midday'
    }
    if (clockTime.twelveHourClockHour === 0 && clockTime.partOfDay === 'am') {
      if (clockTime.minute === 0) {
        return 'midnight'
      }
      return `12:${clockTime.minute.toString().padStart(2, '0')}am`
    }
    return `${clockTime.twelveHourClockHour}:${clockTime.minute.toString().padStart(2, '0')}${clockTime.partOfDay}`
  }

  // example output: 11:00am to 1:00pm
  static formattedTimeRange(startsAt: ClockTime | Date | string, endsAt: ClockTime | Date | string): string {
    return `${this.formattedTime(startsAt)} to ${this.formattedTime(endsAt)}`
  }
}
