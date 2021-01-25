import CalendarDay from './calendarDay'

describe('CalendarDay', () => {
  describe('iso8601', () => {
    it('returns an ISO 8601 formatted date describing the day', () => {
      const calendarDay = CalendarDay.fromComponents(15, 9, 1992)!

      expect(calendarDay.iso8601).toBe('1992-09-15')
    })
  })

  describe('.fromComponents', () => {
    it('returns a date when given components for a day that exists', () => {
      const date = CalendarDay.fromComponents(15, 9, 1992)!

      expect(date).toEqual({ day: 15, month: 9, year: 1992 })
    })

    it('returns null when given 31st February in a non-leap year', () => {
      expect(CalendarDay.fromComponents(2011, 2, 31)).toBeNull()
    })

    it('returns null when given a month out of bounds', () => {
      expect(CalendarDay.fromComponents(2011, 13, 1)).toBeNull()
    })

    it('returns null when given a day out of bounds for any month', () => {
      expect(CalendarDay.fromComponents(2011, 1, 32)).toBeNull()
    })

    it('returns null when given a day out of bounds for the month', () => {
      expect(CalendarDay.fromComponents(2011, 6, 31)).toBeNull()
    })
  })

  describe('.parseIso8601', () => {
    it('returns a calendar day when given a valid ISO 8601 formatted date', () => {
      expect(CalendarDay.parseIso8601('1992-09-15')).toEqual(CalendarDay.fromComponents(15, 9, 1992))
    })

    // This is intentional - a moment in time can’t be mapped
    // to a calendar day without also specifying a time zone.
    it('returns null when given an ISO 8601 formatted date and time', () => {
      expect(CalendarDay.parseIso8601('1992-09-15T12:49:50Z')).toBeNull()
    })

    it('returns null when given something other than an ISO 8601 formatted date', () => {
      expect(CalendarDay.parseIso8601('19920915')).toBeNull()
    })

    it('returns null when given 31st February in a non-leap year', () => {
      expect(CalendarDay.parseIso8601('2011-02-31')).toBeNull()
    })

    it('returns null when given a month out of bounds', () => {
      expect(CalendarDay.parseIso8601('2011-13-01')).toBeNull()
    })

    it('returns null when given a day out of bounds for any month', () => {
      expect(CalendarDay.parseIso8601('2011-01-32')).toBeNull()
    })

    it('returns null when given a day out of bounds for the month', () => {
      expect(CalendarDay.parseIso8601('2011-06-31')).toBeNull()
    })
  })

  describe('utcDate', () => {
    it('returns a Date which falls within this day in the UTC time zone', () => {
      const day = CalendarDay.fromComponents(25, 8, 2021)!
      expect(day.utcDate).toEqual(new Date('2021-08-25T00:00:00Z'))
    })
  })

  describe('.britishDayForDate', () => {
    it('returns the day that the date falls on in Britain', () => {
      expect(CalendarDay.britishDayForDate(new Date('2021-02-25T23:30:00Z'))).toEqual({ day: 25, month: 2, year: 2021 })
    })

    it('handles daylight saving time', () => {
      expect(CalendarDay.britishDayForDate(new Date('2021-08-25T23:30:00Z'))).toEqual({ day: 26, month: 8, year: 2021 })
    })
  })
})
