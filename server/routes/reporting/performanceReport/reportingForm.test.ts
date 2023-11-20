import TestUtils from '../../../../testutils/testUtils'
import CalendarDay from '../../../utils/calendarDay'
import ReportingForm from './reportingForm'

describe(ReportingForm, () => {
  describe('data', () => {
    describe('with valid data', () => {
      it('returns an object with two Calendar Day values', async () => {
        const request = TestUtils.createRequest({
          'from-date-year': '2021',
          'from-date-month': '06',
          'from-date-day': '12',
          'to-date-year': '2021',
          'to-date-month': '06',
          'to-date-day': '13',
        })

        const result = await new ReportingForm(request).data()

        expect(result.value!.fromIncludingDate).toEqual(CalendarDay.fromComponents(12, 6, 2021))
        expect(result.value!.toIncludingDate).toEqual(CalendarDay.fromComponents(13, 6, 2021))
        expect(result.error).toBeNull()
      })
    })

    describe('with invalid data', () => {
      describe('when the "from" date is after the "to" date', () => {
        it('returns an error object with a message', async () => {
          const request = TestUtils.createRequest({
            'from-date-year': '2021',
            'from-date-month': '06',
            'from-date-day': '12',
            'to-date-year': '2021',
            'to-date-month': '06',
            'to-date-day': '11',
          })

          const result = await new ReportingForm(request).data()

          expect(result.value).toBeNull()
          expect(result.error!.errors).toEqual([
            {
              errorSummaryLinkedField: 'from-date-day',
              formFields: ['from-date-day', 'from-date-month', 'from-date-year'],
              message: "Enter a date that is before or the same as the 'date to'",
            },

            {
              errorSummaryLinkedField: 'to-date-day',
              formFields: ['to-date-day', 'to-date-month', 'to-date-year'],
              message: "Enter a date that is later than or the same as the 'date from'",
            },
          ])
        })
      })

      describe('when the "from" date is more than 6 months than the "to" date', () => {
        it('returns an error object with a message', async () => {
          const request = TestUtils.createRequest({
            'from-date-year': '2023',
            'from-date-month': '02',
            'from-date-day': '12',
            'to-date-year': '2023',
            'to-date-month': '11',
            'to-date-day': '16',
          })

          const result = await new ReportingForm(request).data()

          expect(result.value).toBeNull()
          expect(result.error!.errors).toEqual([
            {
              errorSummaryLinkedField: 'from-date-day',
              formFields: ['from-date-day', 'from-date-month', 'from-date-year'],
              message: "Enter a date that is within 6 months of the 'date to'",
            },
            {
              errorSummaryLinkedField: 'to-date-day',
              formFields: ['to-date-day', 'to-date-month', 'to-date-year'],
              message: "Enter a date that is within 6 months of the 'date from'",
            },
          ])
        })
      })

      describe('when the "from" date is before Day One (01/06/2021)', () => {
        it('returns an error object with a message', async () => {
          const request = TestUtils.createRequest({
            'from-date-year': '2021',
            'from-date-month': '05',
            'from-date-day': '12',
            'to-date-year': '2021',
            'to-date-month': '06',
            'to-date-day': '11',
          })

          const result = await new ReportingForm(request).data()

          expect(result.value).toBeNull()
          expect(result.error!.errors).toEqual([
            {
              errorSummaryLinkedField: 'from-date-day',
              formFields: ['from-date-day', 'from-date-month', 'from-date-year'],
              message: 'Data before 01 June 2021 is not available',
            },
          ])
        })
      })

      describe('for dates in the future, for which we have no historical data', () => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayDay = today.getUTCDate().toString()
        const todayYear = today.getUTCFullYear().toString()
        const todayMonth = (Number(today.getUTCMonth()) + 1).toString()

        const tomorrowDay = tomorrow.getUTCDate().toString()
        const tomorrowYear = tomorrow.getUTCFullYear().toString()
        const tomorrowMonth = (Number(tomorrow.getUTCMonth()) + 1).toString()

        it('returns an error object with a message if the "from" date is in the future', async () => {
          const request = TestUtils.createRequest({
            'from-date-year': tomorrowYear,
            'from-date-month': tomorrowMonth,
            'from-date-day': tomorrowDay,
            'to-date-year': tomorrowYear,
            'to-date-month': tomorrowMonth,
            'to-date-day': tomorrowDay,
          })

          const result = await new ReportingForm(request).data()

          expect(result.value).toBeNull()

          expect(result.error!.errors).toEqual([
            {
              errorSummaryLinkedField: 'from-date-day',
              formFields: ['from-date-day', 'from-date-month', 'from-date-year'],
              message: `Data after today is not available`,
            },
            {
              errorSummaryLinkedField: 'to-date-day',
              formFields: ['to-date-day', 'to-date-month', 'to-date-year'],
              message: `Data after today is not available`,
            },
          ])
        })

        it('returns an error object with a message if the "to" date is in the future', async () => {
          const request = TestUtils.createRequest({
            'from-date-year': todayYear,
            'from-date-month': todayMonth,
            'from-date-day': todayDay,
            'to-date-year': tomorrowYear,
            'to-date-month': tomorrowMonth,
            'to-date-day': tomorrowDay,
          })

          const result = await new ReportingForm(request).data()

          expect(result.value).toBeNull()
          expect(result.error!.errors).toEqual([
            {
              errorSummaryLinkedField: 'to-date-day',
              formFields: ['to-date-day', 'to-date-month', 'to-date-year'],
              message: `Data after today is not available`,
            },
          ])
        })
      })

      describe('when there are multiple errors', () => {
        it('returns an error object with multiple errors', async () => {
          const requestForPreDayOneDataWithFromDateAfterToDate = TestUtils.createRequest({
            'from-date-year': '2021',
            'from-date-month': '05',
            'from-date-day': '12',
            'to-date-year': '2021',
            'to-date-month': '05',
            'to-date-day': '11',
          })

          const result = await new ReportingForm(requestForPreDayOneDataWithFromDateAfterToDate).data()

          expect(result.value).toBeNull()
          expect(result.error!.errors).toEqual([
            {
              errorSummaryLinkedField: 'from-date-day',
              formFields: ['from-date-day', 'from-date-month', 'from-date-year'],
              message: 'Data before 01 June 2021 is not available',
            },
            {
              errorSummaryLinkedField: 'from-date-day',
              formFields: ['from-date-day', 'from-date-month', 'from-date-year'],
              message: "Enter a date that is before or the same as the 'date to'",
            },
            {
              errorSummaryLinkedField: 'to-date-day',
              formFields: ['to-date-day', 'to-date-month', 'to-date-year'],
              message: "Enter a date that is later than or the same as the 'date from'",
            },
          ])
        })
      })
    })
  })
})
