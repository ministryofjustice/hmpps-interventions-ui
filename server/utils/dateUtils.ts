import { findTimeZone, getZonedTime } from 'timezone-support'

export default class DateUtils {
  static getMonthName(num: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    return months[num - 1]
  }

  static formatDateTimeOrEmptyString(dateTimeString: string | null): string {
    const date = DateUtils.getDateStringFromDateTimeString(dateTimeString)
    const time = DateUtils.getTimeStringFromDateTimeString(dateTimeString)

    if (!date || !time) {
      return ''
    }

    return `${date}, ${time}`
  }

  static getDateStringFromDateTimeString(dateTime: string | null): string {
    if (dateTime === null) {
      return ''
    }

    const date = new Date(dateTime)

    if (Number.isNaN(Number(date))) {
      return ''
    }

    const ukDate = getZonedTime(date, findTimeZone('Europe/London'))

    const { year } = ukDate
    const month = DateUtils.getMonthName(ukDate.month)
    const day = `0${ukDate.day}`.slice(-2)

    return `${day} ${month} ${year}`
  }

  static getTimeStringFromDateTimeString(dateTime: string | null): string {
    if (dateTime === null) {
      return ''
    }

    const date = new Date(dateTime)

    if (Number.isNaN(Number(date))) {
      return ''
    }

    const ukDate = getZonedTime(date, findTimeZone('Europe/London'))

    const hour = `0${ukDate.hours}`.slice(-2)
    const minutes = `0${ukDate.minutes}`.slice(-2)

    return `${hour}:${minutes}`
  }
}
