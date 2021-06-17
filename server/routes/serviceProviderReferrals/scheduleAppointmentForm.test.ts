import ScheduleAppointmentForm from './scheduleAppointmentForm'
import TestUtils from '../../../testutils/testUtils'

describe(ScheduleAppointmentForm, () => {
  describe('data', () => {
    describe('with valid data', () => {
      it('returns a paramsForUpdate with the completionDeadline key and an ISO-formatted date', async () => {
        const request = TestUtils.createRequest({
          'date-year': '2021',
          'date-month': '09',
          'date-day': '12',
          'time-hour': '1',
          'time-minute': '05',
          'time-part-of-day': 'pm',
          'duration-hours': '1',
          'duration-minutes': '30',
        })

        const data = await new ScheduleAppointmentForm(request).data()

        expect(data.paramsForUpdate).toEqual({ appointmentTime: '2021-09-12T12:05:00.000Z', durationInMinutes: 90 })
      })
    })

    describe('with invalid data', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({
          'date-year': '2021',
          'date-month': '09',
          'date-day': '',
          'time-hour': '1',
          'time-minute': '09',
          'time-part-of-day': '',
          'duration-hours': '',
          'duration-minutes': '',
        })

        const data = await new ScheduleAppointmentForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'date-day',
              formFields: ['date-day'],
              message: 'The session date must include a day',
            },
            {
              errorSummaryLinkedField: 'time-part-of-day',
              formFields: ['time-part-of-day'],
              message: 'Select whether the session time is AM or PM',
            },
            {
              errorSummaryLinkedField: 'duration-hours',
              formFields: ['duration-hours', 'duration-minutes'],
              message: 'Enter a duration',
            },
          ],
        })
      })
    })
  })
})
