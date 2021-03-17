import { findTimeZone, getZonedTime } from 'timezone-support'

function getMonthName(num: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  return months[num - 1]
}

function formatDateTimeOrEmptyString(d: string | null): string {
  if (d === null) {
    return ''
  }

  const date = new Date(d)

  if (Number.isNaN(Number(date))) {
    return ''
  }

  const ukDate = getZonedTime(date, findTimeZone('Europe/London'))

  const { year } = ukDate
  const month = getMonthName(ukDate.month)
  const day = `0${ukDate.day}`.slice(-2)
  const hour = `0${ukDate.hours}`.slice(-2)
  const minutes = `0${ukDate.minutes}`.slice(-2)

  return `${day} ${month} ${year}, ${hour}:${minutes}`
}

export default {
  formatDateTimeOrEmptyString,
}
