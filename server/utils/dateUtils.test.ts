import dateUtils from './dateUtils'

describe('dateUtils', () => {
  describe('formatDateTime', () => {
    it('returns empty string for null datetime input', () => {
      expect(dateUtils.formatDateTimeOrEmptyString(null)).toEqual('')
    })

    it('returns a formatted string with local timezone offset for a valid ISO8601 datetime input', () => {
      expect(dateUtils.formatDateTimeOrEmptyString('2021-02-01T13:00:00Z')).toEqual('01 Feb 2021, 13:00')
      expect(dateUtils.formatDateTimeOrEmptyString('2021-06-01T13:00:00Z')).toEqual('01 Jun 2021, 14:00')
      expect(dateUtils.formatDateTimeOrEmptyString('2020-12-07T13:00:00.000000Z')).toEqual('07 Dec 2020, 13:00')

      expect(dateUtils.formatDateTimeOrEmptyString('2021-02-02T00:30:00+01:00')).toEqual('01 Feb 2021, 23:30')
      expect(dateUtils.formatDateTimeOrEmptyString('2021-06-02T00:30:00+01:00')).toEqual('02 Jun 2021, 00:30')
    })

    it('returns an emtpy string for invalid datetime input', () => {
      expect(dateUtils.formatDateTimeOrEmptyString(' ')).toEqual('')
      expect(dateUtils.formatDateTimeOrEmptyString('abcdefg')).toEqual('')
      expect(dateUtils.formatDateTimeOrEmptyString('2021-06-02T00:30:00+01000:00')).toEqual('')
    })
  })
})
