import CalendarDayInput from './calendarDayInput'
import TestUtils from '../../../../testutils/testUtils'
import CalendarDay from '../../calendarDay'

describe(CalendarDayInput, () => {
  const messages = {
    dayEmpty: 'The deadline must include a day',
    monthEmpty: 'The deadline must include a month',
    yearEmpty: 'The deadline must include a year',
    invalidDate: 'The deadline must be a real date',
  }

  describe('validate', () => {
    describe('with valid data', () => {
      it('returns a CalendarDay value', async () => {
        const request = TestUtils.createRequest({
          'deadline-year': '2021',
          'deadline-month': '09',
          'deadline-day': '12',
        })

        const result = await new CalendarDayInput(request, 'deadline', messages).validate()

        expect(result.value).toEqual(CalendarDay.fromComponents(12, 9, 2021))
      })
    })

    it('returns an error when a field is empty', async () => {
      const request = TestUtils.createRequest({
        'deadline-year': '',
        'deadline-month': '09',
        'deadline-day': '12',
      })

      const result = await new CalendarDayInput(request, 'deadline', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-day',
            formFields: ['deadline-day', 'deadline-month', 'deadline-year'],
            message: 'The deadline must be a real date',
          },
        ],
      })
    })

    it('returns an error when a field is just whitespace', async () => {
      const request = TestUtils.createRequest({
        'deadline-year': '2021',
        'deadline-month': '     ',
        'deadline-day': '12',
      })

      const result = await new CalendarDayInput(request, 'deadline', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-day',
            formFields: ['deadline-day', 'deadline-month', 'deadline-year'],
            message: 'The deadline must be a real date',
          },
        ],
      })
    })

    it('returns an error when a field is non-numeric', async () => {
      const request = TestUtils.createRequest({
        'deadline-year': '2021',
        'deadline-month': '09',
        'deadline-day': 'hello',
      })

      const result = await new CalendarDayInput(request, 'deadline', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-day',
            formFields: ['deadline-day', 'deadline-month', 'deadline-year'],
            message: 'The deadline must be a real date',
          },
        ],
      })
    })

    it('returns an error when the date specified does not exist', async () => {
      const request = TestUtils.createRequest({
        'deadline-year': '2011',
        'deadline-month': '02',
        'deadline-day': '31',
      })

      const result = await new CalendarDayInput(request, 'deadline', messages).validate()

      expect(result.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'deadline-day',
            formFields: ['deadline-day', 'deadline-month', 'deadline-year'],
            message: 'The deadline must be a real date',
          },
        ],
      })
    })
  })
})
