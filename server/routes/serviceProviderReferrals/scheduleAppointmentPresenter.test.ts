import ScheduleAppointmentPresenter from './scheduleAppointmentPresenter'
import appointmentFactory from '../../../testutils/factories/appointment'

describe(ScheduleAppointmentPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const presenter = new ScheduleAppointmentPresenter(appointmentFactory.build())

      expect(presenter.text).toEqual({ title: 'Add appointment details' })
    })
  })

  describe('errorSummary', () => {
    describe('when a server error is passed in', () => {
      it('displays the message from the server error', () => {
        const appointment = appointmentFactory.build()
        const presenter = new ScheduleAppointmentPresenter(
          appointment,
          {
            errors: [
              {
                errorSummaryLinkedField: 'date-day',
                formFields: ['date-day'],
                message: 'The session date must be a real date',
              },
            ],
          },
          null,
          {
            errors: [
              {
                formFields: ['session-input'],
                errorSummaryLinkedField: 'session-input',
                message:
                  'The proposed date and time you selected clashes with another appointment. Please select a different date and time.',
              },
            ],
          }
        )

        expect(presenter.errorSummary).toEqual([
          {
            field: 'session-input',
            message:
              'The proposed date and time you selected clashes with another appointment. Please select a different date and time.',
          },
        ])
      })
    })

    describe('when a standard validation error is passed in', () => {
      it('displays the message from the server error', () => {
        const appointment = appointmentFactory.build()
        const presenter = new ScheduleAppointmentPresenter(
          appointment,
          {
            errors: [
              {
                errorSummaryLinkedField: 'date-day',
                formFields: ['date-day'],
                message: 'The session date must be a real date',
              },
            ],
          },
          null,
          null
        )

        expect(presenter.errorSummary).toEqual([{ field: 'date-day', message: 'The session date must be a real date' }])
      })
    })

    describe('when no error is passed in', () => {
      it('returns null', () => {
        const appointment = appointmentFactory.build()
        const presenter = new ScheduleAppointmentPresenter(appointment)

        expect(presenter.errorSummary).toEqual(null)
      })
    })
  })

  describe('fields', () => {
    describe('with a null appointment', () => {
      it('returns empty fields', () => {
        const presenter = new ScheduleAppointmentPresenter(null)

        expect(presenter.fields).toEqual({
          date: {
            errorMessage: null,
            day: { value: '', hasError: false },
            month: { value: '', hasError: false },
            year: { value: '', hasError: false },
          },
          time: {
            errorMessage: null,
            hour: { value: '', hasError: false },
            minute: { value: '', hasError: false },
            partOfDay: {
              value: null,
              hasError: false,
            },
          },
          duration: {
            errorMessage: null,
            hours: { value: '', hasError: false },
            minutes: { value: '', hasError: false },
          },
        })
      })
    })

    describe('with a populated appointment', () => {
      it('returns values to populate the fields with', () => {
        const appointment = appointmentFactory.build({
          appointmentTime: '2021-03-24T10:30:00Z',
          durationInMinutes: 75,
        })
        const presenter = new ScheduleAppointmentPresenter(appointment)

        expect(presenter.fields).toEqual({
          date: {
            errorMessage: null,
            day: { value: '24', hasError: false },
            month: { value: '3', hasError: false },
            year: { value: '2021', hasError: false },
          },
          time: {
            errorMessage: null,
            hour: { value: '10', hasError: false },
            minute: { value: '30', hasError: false },
            partOfDay: {
              value: 'am',
              hasError: false,
            },
          },
          duration: {
            errorMessage: null,
            hours: { value: '1', hasError: false },
            minutes: { value: '15', hasError: false },
          },
        })
      })
    })
  })
})
