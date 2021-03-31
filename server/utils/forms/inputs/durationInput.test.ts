import DurationInput from './durationInput'
import TestUtils from '../../../../testutils/testUtils'
import Duration from '../../duration'

describe(DurationInput, () => {
  const messages = {
    empty: 'Enter a session duration',
    invalidDuration: 'The session duration must be a real duration',
  }

  describe('validate', () => {
    describe('with valid data', () => {
      it('returns a Duration value when hours and minutes are provided', async () => {
        const request = TestUtils.createRequest({
          'session-duration-hours': '1',
          'session-duration-minutes': '30',
        })

        const result = await new DurationInput(request, 'session-duration', messages).validate()

        expect(result.value).toEqual(Duration.fromUnits(1, 30, 0))
      })

      it('returns a Duration value when just hours are provided', async () => {
        const request = TestUtils.createRequest({
          'session-duration-hours': '1',
          'session-duration-minutes': '',
        })

        const result = await new DurationInput(request, 'session-duration', messages).validate()

        expect(result.value).toEqual(Duration.fromUnits(1, 0, 0))
      })

      it('returns a Duration value when just minutes are provided', async () => {
        const request = TestUtils.createRequest({
          'session-duration-hours': '',
          'session-duration-minutes': '30',
        })

        const result = await new DurationInput(request, 'session-duration', messages).validate()

        expect(result.value).toEqual(Duration.fromUnits(0, 30, 0))
      })
    })

    it('returns an error when hours and minutes are both empty', async () => {
      const request = TestUtils.createRequest({
        'session-duration-hours': '',
        'session-duration-minutes': '',
      })

      const result = await new DurationInput(request, 'session-duration', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'session-duration-hours',
            formFields: ['session-duration-hours', 'session-duration-minutes'],
            message: 'Enter a session duration',
          },
        ],
      })
    })

    it('returns an error when hours and minutes are both just whitespace', async () => {
      const request = TestUtils.createRequest({
        'session-duration-hours': '   ',
        'session-duration-minutes': '     ',
      })

      const result = await new DurationInput(request, 'session-duration', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'session-duration-hours',
            formFields: ['session-duration-hours', 'session-duration-minutes'],
            message: 'Enter a session duration',
          },
        ],
      })
    })

    it('returns an error when a field is non-numeric', async () => {
      const request = TestUtils.createRequest({
        'session-duration-hours': '1',
        'session-duration-minutes': 'hello',
      })

      const result = await new DurationInput(request, 'session-duration', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'session-duration-minutes',
            formFields: ['session-duration-minutes'],
            message: 'The session duration must be a real duration',
          },
        ],
      })
    })

    it('returns an error when a field is not an integer', async () => {
      const request = TestUtils.createRequest({
        'session-duration-hours': '1',
        'session-duration-minutes': '30.5',
      })

      const result = await new DurationInput(request, 'session-duration', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'session-duration-minutes',
            formFields: ['session-duration-minutes'],
            message: 'The session duration must be a real duration',
          },
        ],
      })
    })

    it('returns an error when a field is negative', async () => {
      const request = TestUtils.createRequest({
        'session-duration-hours': '1',
        'session-duration-minutes': '-30',
      })

      const result = await new DurationInput(request, 'session-duration', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'session-duration-hours',
            formFields: ['session-duration-hours', 'session-duration-minutes'],
            message: 'The session duration must be a real duration',
          },
        ],
      })
    })
  })
})
