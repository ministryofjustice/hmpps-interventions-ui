import Duration from './duration'

describe(Duration, () => {
  describe('.fromUnits', () => {
    it('converts hours, minutes and seconds to seconds', () => {
      expect(Duration.fromUnits(10, 5, 32)!.seconds).toEqual(36332)
      expect(Duration.fromUnits(0, 500, 0)!.seconds).toEqual(30000)
    })

    it('returns null with invalid input', () => {
      expect(Duration.fromUnits(-1, 1, 1)).toBeNull()
      expect(Duration.fromUnits(1, -1, 1)).toBeNull()
      expect(Duration.fromUnits(1, 1, -1)).toBeNull()
    })
  })

  describe('minutes', () => {
    it('returns the number of minutes when the duration is a full number of minutes', () => {
      expect(new Duration(120).minutes).toEqual(2)
    })

    it('returns null when the duration is not a full number of minutes', () => {
      expect(new Duration(121).minutes).toBeNull()
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
