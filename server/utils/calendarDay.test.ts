import CalendarDay from './calendarDay'

describe('CalendarDay', () => {
  describe('iso8601', () => {
    it('returns an ISO 8601 formatted date describing the day', () => {
      const calendarDay = CalendarDay.fromComponents(15, 9, 1992)

      expect(calendarDay.iso8601).toBe('1992-09-15')
    })
  })

  describe('.fromComponents', () => {
    it('returns a date when given components for a day that exists', () => {
      const date = CalendarDay.fromComponents(15, 9, 1992)

      expect(date.day).toBe(15)
      expect(date.month).toBe(9)
      expect(date.year).toBe(1992)
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
})
