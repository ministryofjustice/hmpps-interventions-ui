import DateUtils from './dateUtils'
import CalendarDay from './calendarDay'
import ClockTime from './clockTime'

describe('DateUtils', () => {
  describe('formattedDateTime', () => {
    it('returns a formatted string with local timezone offset for a valid ISO8601 datetime input', () => {
      expect(DateUtils.formattedDateTime('2021-02-01T13:00:00Z')).toEqual('1:00pm on 1 February 2021')
      expect(DateUtils.formattedDateTime('2021-06-01T13:00:00Z')).toEqual('2:00pm on 1 June 2021')
      expect(DateUtils.formattedDateTime('2020-12-07T13:00:00.000000Z')).toEqual('1:00pm on 7 December 2020')
      // Display BST as GMT during winter
      expect(DateUtils.formattedDateTime('2021-02-02T00:30:00+01:00')).toEqual('11:30pm on 1 February 2021')
      expect(DateUtils.formattedDateTime('2021-02-01T23:30:00+00:00')).toEqual('11:30pm on 1 February 2021')
      // Display BST as BST during summer
      expect(DateUtils.formattedDateTime('2021-06-02T00:30:00+01:00')).toEqual('12:30am on 2 June 2021')
      expect(DateUtils.formattedDateTime('2021-06-01T23:30:00+00:00')).toEqual('12:30am on 2 June 2021')
    })
  })

  describe('formattedDate', () => {
    describe('with various date formats', () => {
      it('returns the correctly formatted date', () => {
        expect(DateUtils.formattedDate('2021-06-02')).toEqual('2 June 2021')
        // Display as GMT during winter
        expect(DateUtils.formattedDate('2021-02-02T00:30:00+01:00')).toEqual('1 February 2021')
        // Display as BST during summer
        expect(DateUtils.formattedDate('2021-06-02T00:30:00+01:00')).toEqual('2 June 2021')
        expect(DateUtils.formattedDate('2021-06-02T00:30:00')).toEqual('2 June 2021')
      })
    })

    it('returns the correctly formatted date for CalendarDay', () => {
      expect(DateUtils.formattedDate(CalendarDay.fromComponents(2, 6, 2021)!)).toEqual('2 June 2021')
    })

    it('returns the correctly formatted date for js Date', () => {
      // Note that js Dates are 0 indexed for months
      expect(DateUtils.formattedDate(new Date(2021, 5, 2))).toEqual('2 June 2021')
    })

    describe('with short month option', () => {
      it('returns the shortened month', () => {
        expect(DateUtils.formattedDate('2021-06-02', { month: 'short' })).toEqual('2 Jun 2021')
      })
    })
  })

  describe('formattedTime', () => {
    // No official guidance on how to display 12:30pm/am (should it be something like '12:30 midday/midnight' instead)?
    it('returns the correct values for midday and midnight', () => {
      expect(DateUtils.formattedTime('2021-06-02T12:00:00+01:00')).toEqual('midday')
      expect(DateUtils.formattedTime('2021-06-02T12:30:00+01:00')).toEqual('12:30pm')
      expect(DateUtils.formattedTime('2021-06-02T24:00:00+01:00')).toEqual('midnight')
      expect(DateUtils.formattedTime('2021-06-02T00:30:00+01:00')).toEqual('12:30am')
    })

    it('returns the time section of the formatted date time string', () => {
      // Display BST as GMT during winter
      expect(DateUtils.formattedTime('2021-06-02T00:30:00+01:00')).toEqual('12:30am')
      expect(DateUtils.formattedTime('2021-06-02T23:30:00+00:00')).toEqual('12:30am')
      // Display BST as BST during summer
      expect(DateUtils.formattedTime('2021-02-02T00:30:00+01:00')).toEqual('11:30pm')
      expect(DateUtils.formattedTime('2021-02-02T23:30:00+00:00')).toEqual('11:30pm')
    })

    it('returns the correctly formatted date for ClockTime', () => {
      expect(DateUtils.formattedTime(ClockTime.fromTwentyFourHourComponents(17, 30, 30)!)).toEqual('5:30pm')
    })

    it('returns the correctly formatted date for js Date', () => {
      // Note that js Dates are 0 indexed for months
      expect(DateUtils.formattedTime(new Date(Date.UTC(2021, 5, 2, 17, 30)))).toEqual('6:30pm')
    })

    it('returns capitalized words when capitalized option is specified', () => {
      expect(DateUtils.formattedTime('2021-06-02T12:00:00+01:00', { casing: 'capitalized' })).toEqual('Midday')
      expect(DateUtils.formattedTime('2021-06-02T24:00:00+01:00', { casing: 'capitalized' })).toEqual('Midnight')
    })
  })

  describe('formattedTimeRange', () => {
    it('returns the correctly formatted time range for string', () => {
      expect(DateUtils.formattedTimeRange('2021-06-02T05:30:00+01:00', '2021-06-02T18:30:00+01:00')).toEqual(
        '5:30am to 6:30pm'
      )
    })

    it('returns the correctly formatted time range for ClockTime', () => {
      expect(
        DateUtils.formattedTimeRange(
          ClockTime.fromTwentyFourHourComponents(5, 30, 30)!,
          ClockTime.fromTwentyFourHourComponents(18, 30, 30)!
        )
      ).toEqual('5:30am to 6:30pm')
    })

    it('returns the correctly formatted time range for js Date', () => {
      expect(
        DateUtils.formattedTimeRange(new Date(Date.UTC(2021, 5, 2, 5, 30)), new Date(Date.UTC(2021, 5, 2, 18, 30)))
      ).toEqual('6:30am to 7:30pm')
    })

    it('returns capitalized words when capitalized option is specified', () => {
      expect(
        DateUtils.formattedTimeRange('2021-06-02T12:00:00+01:00', '2021-06-02T24:00:00+01:00', {
          casing: 'capitalized',
        })
      ).toEqual('Midday to midnight')
      expect(
        DateUtils.formattedTimeRange('2021-06-02T24:00:00+01:00', '2021-06-02T12:00:00+01:00', {
          casing: 'capitalized',
        })
      ).toEqual('Midnight to midday')
    })
  })
})
