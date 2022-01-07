import TestUtils from '../../../../testutils/testUtils'
import TwelveHourBritishDateTimeInput from './twelveHourBritishDateTimeInput'

describe(TwelveHourBritishDateTimeInput, () => {
  const messages = {
    calendarDay: {
      dayEmpty: 'The deadline must include a day',
      monthEmpty: 'The deadline must include a month',
      yearEmpty: 'The deadline must include a year',
      invalidDate: 'The deadline date must be a real date',
    },
    clockTime: {
      hourEmpty: 'The deadline must include an hour',
      minuteEmpty: 'The deadline must include a minute',
      partOfDayEmpty: 'Select whether the deadline is AM or PM',
      invalidTime: 'The deadline time must be a real time',
    },
    invalidTime: 'The deadline time must exist on the deadline day',
    pastTime: 'The deadline cannot be in the past',
  }

  describe('validate', () => {
    describe('with valid data', () => {
      it('returns the date that the day and time occur in Britain', async () => {
        const request = TestUtils.createRequest({
          'deadline-date-year': '2021',
          'deadline-date-month': '09',
          'deadline-date-day': '12',
          'deadline-time-hour': '1',
          'deadline-time-minute': '05',
          'deadline-time-part-of-day': 'pm',
        })

        const result = await new TwelveHourBritishDateTimeInput(
          request,
          'deadline-date',
          'deadline-time',
          messages
        ).validate()

        expect(result.value).toEqual(new Date('2021-09-12T12:05:00Z'))
      })
    })

    it('returns an error when the date is invalid', async () => {
      const request = TestUtils.createRequest({
        'deadline-date-year': '2021',
        'deadline-date-month': '09',
        'deadline-date-day': '',
        'deadline-time-hour': '1',
        'deadline-time-minute': '05',
        'deadline-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourBritishDateTimeInput(
        request,
        'deadline-date',
        'deadline-time',
        messages
      ).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-date-day',
            formFields: ['deadline-date-day'],
            message: 'The deadline must include a day',
          },
        ],
      })
    })

    it('returns an error when the time is invalid', async () => {
      const request = TestUtils.createRequest({
        'deadline-date-year': '2021',
        'deadline-date-month': '09',
        'deadline-date-day': '12',
        'deadline-time-hour': '',
        'deadline-time-minute': '05',
        'deadline-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourBritishDateTimeInput(
        request,
        'deadline-date',
        'deadline-time',
        messages
      ).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-time-hour',
            formFields: ['deadline-time-hour'],
            message: 'The deadline must include an hour',
          },
        ],
      })
    })

    it('returns multiple errors when both the date and time are invalid', async () => {
      const request = TestUtils.createRequest({
        'deadline-date-year': '2021',
        'deadline-date-month': '09',
        'deadline-date-day': '',
        'deadline-time-hour': '',
        'deadline-time-minute': '05',
        'deadline-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourBritishDateTimeInput(
        request,
        'deadline-date',
        'deadline-time',
        messages
      ).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-date-day',
            formFields: ['deadline-date-day'],
            message: 'The deadline must include a day',
          },
          {
            errorSummaryLinkedField: 'deadline-time-hour',
            formFields: ['deadline-time-hour'],
            message: 'The deadline must include an hour',
          },
        ],
      })
    })

    it('returns an error when the date / time combination doesn’t exist in Britain', async () => {
      const request = TestUtils.createRequest({
        'deadline-date-year': '2021',
        'deadline-date-month': '03',
        'deadline-date-day': '28',
        'deadline-time-hour': '1',
        'deadline-time-minute': '30',
        'deadline-time-part-of-day': 'am',
      })

      const result = await new TwelveHourBritishDateTimeInput(
        request,
        'deadline-date',
        'deadline-time',
        messages
      ).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-time-hour',
            formFields: ['deadline-time-hour', 'deadline-time-minute', 'deadline-time-part-of-day'],
            message: 'The deadline time must exist on the deadline day',
          },
        ],
      })
    })

    describe('with valid date and earliestAllowedTime', () => {
      it('returns the date when earliestAllowedTime is before the input time', async () => {
        const request = TestUtils.createRequest({
          'deadline-date-year': '2021',
          'deadline-date-month': '09',
          'deadline-date-day': '12',
          'deadline-time-hour': '1',
          'deadline-time-minute': '05',
          'deadline-time-part-of-day': 'pm',
        })

        const result = await new TwelveHourBritishDateTimeInput(
          request,
          'deadline-date',
          'deadline-time',
          messages,
          // month is zero indexed!
          new Date(2021, 8, 11, 9, 0, 0)
        ).validate()

        expect(result.error).toBeNull()
      })

      it('returns an error when the earliest time is on the same day', async () => {
        const request = TestUtils.createRequest({
          'deadline-date-year': '2021',
          'deadline-date-month': '09',
          'deadline-date-day': '12',
          'deadline-time-hour': '1',
          'deadline-time-minute': '05',
          'deadline-time-part-of-day': 'pm',
        })

        const result = await new TwelveHourBritishDateTimeInput(
          request,
          'deadline-date',
          'deadline-time',
          messages,
          // month is zero indexed!
          new Date(2021, 8, 12, 14, 0, 0)
        ).validate()

        expect(result.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'deadline-time-hour',
              formFields: ['deadline-time-hour', 'deadline-time-minute', 'deadline-time-part-of-day'],
              message: 'The deadline cannot be in the past',
            },
          ],
        })
      })

      it('returns an error when the earliest time is on a different day', async () => {
        const request = TestUtils.createRequest({
          'deadline-date-year': '2021',
          'deadline-date-month': '09',
          'deadline-date-day': '12',
          'deadline-time-hour': '1',
          'deadline-time-minute': '05',
          'deadline-time-part-of-day': 'pm',
        })

        const result = await new TwelveHourBritishDateTimeInput(
          request,
          'deadline-date',
          'deadline-time',
          messages,
          // month is zero indexed!
          new Date(2021, 8, 13, 9, 0, 0)
        ).validate()

        expect(result.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'deadline-date-day',
              formFields: ['deadline-date-day', 'deadline-date-month', 'deadline-date-year'],
              message: 'The deadline cannot be in the past',
            },
          ],
        })
      })
    })
  })
})
