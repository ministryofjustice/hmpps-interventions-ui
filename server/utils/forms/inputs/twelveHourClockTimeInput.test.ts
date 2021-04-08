import TwelveHourClockTimeInput from './twelveHourClockTimeInput'
import TestUtils from '../../../../testutils/testUtils'
import ClockTime from '../../clockTime'

describe(TwelveHourClockTimeInput, () => {
  const messages = {
    hourEmpty: 'The alarm time must include an hour',
    minuteEmpty: 'The alarm time must include a minute',
    partOfDayEmpty: 'Select whether the alarm time is AM or PM',
    invalidTime: 'The alarm time must be a real time',
  }

  describe('validate', () => {
    describe('with valid data', () => {
      it('returns a ClockTime value for an AM time', async () => {
        const request = TestUtils.createRequest({
          'alarm-time-hour': '1',
          'alarm-time-minute': '05',
          'alarm-time-part-of-day': 'am',
        })

        const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

        expect(result.value).toEqual(ClockTime.fromTwentyFourHourComponents(1, 5, 0))
      })

      it('returns a ClockTime value for a PM time', async () => {
        const request = TestUtils.createRequest({
          'alarm-time-hour': '1',
          'alarm-time-minute': '05',
          'alarm-time-part-of-day': 'pm',
        })

        const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

        expect(result.value).toEqual(ClockTime.fromTwentyFourHourComponents(13, 5, 0))
      })
    })

    it('returns an error when a field is empty', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '',
        'alarm-time-minute': '09',
        'alarm-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-hour',
            formFields: ['alarm-time-hour'],
            message: 'The alarm time must include an hour',
          },
        ],
      })
    })

    it('returns an error when multiple fields are empty', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '',
        'alarm-time-minute': '',
        'alarm-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-hour',
            formFields: ['alarm-time-hour'],
            message: 'The alarm time must include an hour',
          },
        ],
      })
    })

    it('returns an error when part of day is blank', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '1',
        'alarm-time-minute': '09',
        'alarm-time-part-of-day': '',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-part-of-day',
            formFields: ['alarm-time-part-of-day'],
            message: 'Select whether the alarm time is AM or PM',
          },
        ],
      })
    })

    it('returns an error when part of day is neither “am” nor “pm”', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '1',
        'alarm-time-minute': '09',
        'alarm-time-part-of-day': 'rabbit',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-part-of-day',
            formFields: ['alarm-time-part-of-day'],
            message: 'The alarm time must be a real time',
          },
        ],
      })
    })

    it('returns an error when a field is just whitespace', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '1',
        'alarm-time-minute': '     ',
        'alarm-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-minute',
            formFields: ['alarm-time-minute'],
            message: 'The alarm time must include a minute',
          },
        ],
      })
    })

    it('returns an error when a field is non-numeric', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '1',
        'alarm-time-minute': 'hello',
        'alarm-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-minute',
            formFields: ['alarm-time-minute'],
            message: 'The alarm time must be a real time',
          },
        ],
      })
    })

    it('returns an error when a field is not an integer', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '1',
        'alarm-time-minute': '5.1',
        'alarm-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-minute',
            formFields: ['alarm-time-minute'],
            message: 'The alarm time must be a real time',
          },
        ],
      })
    })

    it('returns an error when the time specified is outside the boundaries of a 12-hour time', async () => {
      const request = TestUtils.createRequest({
        'alarm-time-hour': '13',
        'alarm-time-minute': '05',
        'alarm-time-part-of-day': 'pm',
      })

      const result = await new TwelveHourClockTimeInput(request, 'alarm-time', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'alarm-time-hour',
            formFields: ['alarm-time-hour', 'alarm-time-minute', 'alarm-time-part-of-day'],
            message: 'The alarm time must be a real time',
          },
        ],
      })
    })
  })
})
