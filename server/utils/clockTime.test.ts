import ClockTime from './clockTime'

describe(ClockTime, () => {
  describe('fromComponents', () => {
    describe('with valid input', () => {
      it('returns a time object', () => {
        expect(ClockTime.fromTwentyFourHourComponents(0, 0, 0)).not.toBeNull()
        expect(ClockTime.fromTwentyFourHourComponents(23, 59, 59)).not.toBeNull()
      })
    })

    describe('with invalid input', () => {
      it('returns null', () => {
        expect(ClockTime.fromTwentyFourHourComponents(24, 0, 0)).toBeNull()
        expect(ClockTime.fromTwentyFourHourComponents(0, 61, 0)).toBeNull()
        expect(ClockTime.fromTwentyFourHourComponents(0, 0, 61)).toBeNull()

        expect(ClockTime.fromTwentyFourHourComponents(-1, 0, 0)).toBeNull()
        expect(ClockTime.fromTwentyFourHourComponents(0, -1, 0)).toBeNull()
        expect(ClockTime.fromTwentyFourHourComponents(0, 0, -1)).toBeNull()
      })
    })
  })

  describe('fromTwelveHourComponents', () => {
    describe('with valid input', () => {
      it('returns a time object', () => {
        expect(ClockTime.fromTwelveHourComponents(0, 0, 0, 'am')).toEqual({ hour: 0, minute: 0, second: 0 })
        expect(ClockTime.fromTwelveHourComponents(9, 30, 20, 'am')).toEqual({ hour: 9, minute: 30, second: 20 })
        expect(ClockTime.fromTwelveHourComponents(12, 0, 0, 'pm')).toEqual({ hour: 12, minute: 0, second: 0 })
        expect(ClockTime.fromTwelveHourComponents(12, 30, 20, 'pm')).toEqual({ hour: 12, minute: 30, second: 20 })
        expect(ClockTime.fromTwelveHourComponents(11, 59, 59, 'pm')).toEqual({ hour: 23, minute: 59, second: 59 })
        expect(ClockTime.fromTwelveHourComponents(9, 30, 20, 'pm')).toEqual({ hour: 21, minute: 30, second: 20 })
      })
    })

    describe('with invalid input', () => {
      it('returns null', () => {
        expect(ClockTime.fromTwelveHourComponents(13, 0, 0, 'am')).toBeNull()
        expect(ClockTime.fromTwelveHourComponents(0, 61, 0, 'am')).toBeNull()
        expect(ClockTime.fromTwelveHourComponents(0, 0, 61, 'am')).toBeNull()

        expect(ClockTime.fromTwelveHourComponents(-1, 0, 0, 'am')).toBeNull()
        expect(ClockTime.fromTwelveHourComponents(-1, 0, 0, 'pm')).toBeNull()
        expect(ClockTime.fromTwelveHourComponents(12, 0, 0, 'am')).toBeNull()
        expect(ClockTime.fromTwelveHourComponents(0, 0, 0, 'pm')).toBeNull()
        expect(ClockTime.fromTwelveHourComponents(0, -1, 0, 'am')).toBeNull()
        expect(ClockTime.fromTwelveHourComponents(0, 0, -1, 'am')).toBeNull()
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
      expect(ClockTime.fromTwentyFourHourComponents(10, 0, 0)!.twelveHourClockHour).toEqual(10)
    })

    it('returns 0 for midnight', () => {
      expect(ClockTime.fromTwentyFourHourComponents(0, 0, 0)!.twelveHourClockHour).toEqual(0)
    })

    it('returns 12 for midday', () => {
      expect(ClockTime.fromTwentyFourHourComponents(12, 0, 0)!.twelveHourClockHour).toEqual(12)
    })

    it('returns the correct hour for afternoon times', () => {
      expect(ClockTime.fromTwentyFourHourComponents(22, 0, 0)!.twelveHourClockHour).toEqual(10)
    })
  })

  describe('partOfDay', () => {
    it("returns 'am' for morning times", () => {
      expect(ClockTime.fromTwentyFourHourComponents(10, 0, 0)!.partOfDay).toEqual('am')
    })

    it("returns 'am' for midnight", () => {
      expect(ClockTime.fromTwentyFourHourComponents(0, 0, 0)!.partOfDay).toEqual('am')
    })

    it("returns 'pm' for midday", () => {
      expect(ClockTime.fromTwentyFourHourComponents(12, 0, 0)!.partOfDay).toEqual('pm')
    })

    it("returns 'pm' for afternoon times", () => {
      expect(ClockTime.fromTwentyFourHourComponents(22, 0, 0)!.partOfDay).toEqual('pm')
    })
  })
})
