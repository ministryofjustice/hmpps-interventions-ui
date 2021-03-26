import DateUtils from './dateUtils'

describe('DateUtils', () => {
  describe('formatDateTime', () => {
    it('returns empty string for null datetime input', () => {
      expect(DateUtils.formatDateTimeOrEmptyString(null)).toEqual('')
    })

    it('returns a formatted string with local timezone offset for a valid ISO8601 datetime input', () => {
      expect(DateUtils.formatDateTimeOrEmptyString('2021-02-01T13:00:00Z')).toEqual('01 Feb 2021, 13:00')
      expect(DateUtils.formatDateTimeOrEmptyString('2021-06-01T13:00:00Z')).toEqual('01 Jun 2021, 14:00')
      expect(DateUtils.formatDateTimeOrEmptyString('2020-12-07T13:00:00.000000Z')).toEqual('07 Dec 2020, 13:00')

      expect(DateUtils.formatDateTimeOrEmptyString('2021-02-02T00:30:00+01:00')).toEqual('01 Feb 2021, 23:30')
      expect(DateUtils.formatDateTimeOrEmptyString('2021-06-02T00:30:00+01:00')).toEqual('02 Jun 2021, 00:30')
    })

    it('returns an emtpy string for invalid datetime input', () => {
      expect(DateUtils.formatDateTimeOrEmptyString(' ')).toEqual('')
      expect(DateUtils.formatDateTimeOrEmptyString('abcdefg')).toEqual('')
      expect(DateUtils.formatDateTimeOrEmptyString('2021-06-02T00:30:00+01000:00')).toEqual('')
    })
  })

  describe('getDateStringFromDateTimeString', () => {
    it('returns the time section of the formatted date time string', () => {
      const dateTimeString = '2021-06-02T00:30:00+01:00'
      expect(DateUtils.getDateStringFromDateTimeString(dateTimeString)).toEqual('02 Jun 2021')
    })

    it('returns an empty string for null datetime input', () => {
      expect(DateUtils.getDateStringFromDateTimeString(null)).toEqual('')
    })

    it('returns an empty string for invalid datetime input', () => {
      expect(DateUtils.getDateStringFromDateTimeString(' ')).toEqual('')
      expect(DateUtils.getDateStringFromDateTimeString('abcdefg')).toEqual('')
      expect(DateUtils.getDateStringFromDateTimeString('2021-06-02T00:30:00+01000:00')).toEqual('')
    })
  })

  describe('getTimeStringFromDateTimeString', () => {
    it('returns the time section of the formatted date time string', () => {
      const dateTimeString = '2021-06-02T00:30:00+01:00'
      expect(DateUtils.getTimeStringFromDateTimeString(dateTimeString)).toEqual('00:30')
    })

    it('returns an empty string for null datetime input', () => {
      expect(DateUtils.getTimeStringFromDateTimeString(null)).toEqual('')
    })

    it('returns an empty string for invalid datetime input', () => {
      expect(DateUtils.getTimeStringFromDateTimeString(' ')).toEqual('')
      expect(DateUtils.getTimeStringFromDateTimeString('abcdefg')).toEqual('')
      expect(DateUtils.getTimeStringFromDateTimeString('2021-06-02T00:30:00+01000:00')).toEqual('')
    })
  })
})
