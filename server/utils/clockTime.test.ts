import ClockTime from './clockTime'

describe(ClockTime, () => {
  describe('fromComponents', () => {
    describe('with valid input', () => {
      it('returns a time object', () => {
        expect(ClockTime.fromComponents(0, 0, 0)).not.toBeNull()
        expect(ClockTime.fromComponents(23, 59, 59)).not.toBeNull()
      })
    })

    describe('with invalid input', () => {
      it('returns null', () => {
        expect(ClockTime.fromComponents(24, 0, 0)).toBeNull()
        expect(ClockTime.fromComponents(0, 61, 0)).toBeNull()
        expect(ClockTime.fromComponents(0, 0, 61)).toBeNull()

        expect(ClockTime.fromComponents(-1, 0, 0)).toBeNull()
        expect(ClockTime.fromComponents(0, -1, 0)).toBeNull()
        expect(ClockTime.fromComponents(0, 0, -1)).toBeNull()
      })
    })
  })

  describe('britishTimeForDate', () => {
    it('returns the time that the date occurs at in Britain', () => {
      expect(ClockTime.britishTimeForDate(new Date('2021-02-25T23:30:05Z'))).toEqual({
        hour: 23,
        minute: 30,
        second: 5,
      })
    })

    it('handles daylight saving time', () => {
      expect(ClockTime.britishTimeForDate(new Date('2021-08-25T23:30:05Z'))).toEqual({
        hour: 0,
        minute: 30,
        second: 5,
      })
    })
  })

  describe('twelveHourClockHour', () => {
    it('returns the correct hour for morning times', () => {
      expect(ClockTime.fromComponents(10, 0, 0)!.twelveHourClockHour).toEqual(10)
    })

    it('returns 0 for midnight', () => {
      expect(ClockTime.fromComponents(0, 0, 0)!.twelveHourClockHour).toEqual(0)
    })

    it('returns 12 for midday', () => {
      expect(ClockTime.fromComponents(12, 0, 0)!.twelveHourClockHour).toEqual(12)
    })

    it('returns the correct hour for afternoon times', () => {
      expect(ClockTime.fromComponents(22, 0, 0)!.twelveHourClockHour).toEqual(10)
    })
  })

  describe('partOfDay', () => {
    it("returns 'am' for morning times", () => {
      expect(ClockTime.fromComponents(10, 0, 0)!.partOfDay).toEqual('am')
    })

    it("returns 'am' for midnight", () => {
      expect(ClockTime.fromComponents(0, 0, 0)!.partOfDay).toEqual('am')
    })

    it("returns 'pm' for midday", () => {
      expect(ClockTime.fromComponents(12, 0, 0)!.partOfDay).toEqual('pm')
    })

    it("returns 'pm' for afternoon times", () => {
      expect(ClockTime.fromComponents(22, 0, 0)!.partOfDay).toEqual('pm')
    })
  })
})
