import Duration from './duration'

describe(Duration, () => {
  describe('.fromUnits', () => {
    it('converts hours, minutes and seconds to seconds', () => {
      expect(Duration.fromUnits(10, 5, 32).seconds).toEqual(36332)
      expect(Duration.fromUnits(0, 500, 0).seconds).toEqual(30000)
    })
  })

  describe('stopwatch values', () => {
    it('returns the correct values', () => {
      const duration = new Duration(10 * 3600 + 5 * 60 + 32.5)

      expect(duration.stopwatchHours).toEqual(10)
      expect(duration.stopwatchMinutes).toEqual(5)
      expect(duration.stopwatchSeconds).toEqual(32.5)
    })
  })
})
