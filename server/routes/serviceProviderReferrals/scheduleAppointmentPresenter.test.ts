import ScheduleAppointmentPresenter from './scheduleAppointmentPresenter'
import appointmentFactory from '../../../testutils/factories/appointment'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import authUserDetailsFactory from '../../../testutils/factories/hmppsAuthUser'

describe(ScheduleAppointmentPresenter, () => {
  const referral = sentReferralFactory.build()

  describe('text', () => {
    describe('title', () => {
      describe('when the session has not yet been scheduled', () => {
        it('returns an appropriate title', () => {
          const presenter = new ScheduleAppointmentPresenter(referral, null)

          expect(presenter.text).toEqual({ title: 'Add appointment details' })
        })
      })

      describe('when the session has already been scheduled', () => {
        it('returns an appropriate title', () => {
          const presenter = new ScheduleAppointmentPresenter(referral, appointmentFactory.build())

          expect(presenter.text).toEqual({ title: 'Change appointment details' })
        })
      })

      describe('when the session has already been attended', () => {
        it('returns an appropriate title', () => {
          const presenter = new ScheduleAppointmentPresenter(referral, appointmentFactory.attended('no').build())
          expect(presenter.text).toEqual({ title: 'Add appointment details' })
        })
      })
    })
  })

  describe('appointmentSummary', () => {
    describe('when the appointment has not yet been scheduled', () => {
      it('should return an empty summary', () => {
        const presenter = new ScheduleAppointmentPresenter(referral, null)
        expect(presenter.appointmentSummary).toEqual([])
      })
    })

    describe('when the appointment has been attended', () => {
      describe('when an assigned caseworker is provided', () => {
        it('should return appointment summary with caseworker details', () => {
          const presenter = new ScheduleAppointmentPresenter(
            referral,
            appointmentFactory.attended('no').build({
              appointmentTime: new Date('2021-01-02T12:00:00Z').toISOString(),
              durationInMinutes: 60,
              appointmentDeliveryType: 'VIDEO_CALL',
            }),
            authUserDetailsFactory.build({ firstName: 'firstName', lastName: 'lastName' })
          )
          expect(presenter.appointmentSummary).toEqual([
            { key: 'Caseworker', lines: ['firstName lastName'] },
            { key: 'Date', lines: ['2 January 2021'] },
            { key: 'Time', lines: ['12:00pm to 1:00pm'] },
            { key: 'Method', lines: ['Video call'] },
          ])
        })
      })
      describe('when no assigned caseworker is provided', () => {
        it('should return appointment summary without caseworker details', () => {
          const presenter = new ScheduleAppointmentPresenter(
            referral,
            appointmentFactory.attended('no').build({
              appointmentTime: new Date('2021-01-02T12:00:00Z').toISOString(),
              durationInMinutes: 60,
              appointmentDeliveryType: 'VIDEO_CALL',
            }),
            null
          )
          expect(presenter.appointmentSummary).toEqual([
            { key: 'Date', lines: ['2 January 2021'] },
            { key: 'Time', lines: ['12:00pm to 1:00pm'] },
            { key: 'Method', lines: ['Video call'] },
          ])
        })
      })
    })
  })

  describe('appointmentAlreadyAttended', () => {
    describe('when the appointment has not yet been scheduled', () => {
      it('should return false', () => {
        const presenter = new ScheduleAppointmentPresenter(referral, null)
        expect(presenter.appointmentAlreadyAttended).toBe(false)
      })
    })

    describe('when the appointment has been scheduled but not yet attended', () => {
      it('should return false', () => {
        const presenter = new ScheduleAppointmentPresenter(referral, appointmentFactory.build())
        expect(presenter.appointmentAlreadyAttended).toBe(false)
      })
    })

    describe('when the appointment has been scheduled and attended', () => {
      describe('and the appointment is an initial assessment', () => {
        it('should return true', () => {
          const presenter = new ScheduleAppointmentPresenter(referral, appointmentFactory.attended('no').build())
          expect(presenter.appointmentAlreadyAttended).toBe(true)
        })
      })

      describe('and the appointment is part of an action plan', () => {
        it('should return false', () => {
          const presenter = new ScheduleAppointmentPresenter(
            referral,
            actionPlanAppointmentFactory.attended('no').build()
          )
          expect(presenter.appointmentAlreadyAttended).toBe(false)
        })
      })
    })
  })

  describe('errorSummary', () => {
    describe('when a server error is passed in', () => {
      it('displays the message from the server error', () => {
        const appointment = appointmentFactory.build()
        const presenter = new ScheduleAppointmentPresenter(
          referral,
          appointment,
          null,
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
          referral,
          appointment,
          null,
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
        const presenter = new ScheduleAppointmentPresenter(referral, appointment)

        expect(presenter.errorSummary).toEqual(null)
      })
    })
  })

  describe('fields', () => {
    describe('with a null appointment', () => {
      it('returns empty fields', () => {
        const presenter = new ScheduleAppointmentPresenter(referral, null)

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
          meetingMethod: { value: null, errorMessage: null },
          address: {
            value: null,
            errors: {
              firstAddressLine: null,
              postcode: null,
            },
          },
        })
      })
    })

    describe('when the appointment has already been attended', () => {
      it('should return empty fields', () => {
        const presenter = new ScheduleAppointmentPresenter(referral, appointmentFactory.attended('no').build())

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
          meetingMethod: { value: null, errorMessage: null },
          address: {
            value: null,
            errors: {
              firstAddressLine: null,
              postcode: null,
            },
          },
        })
      })
    })

    describe('with a non attended appointment', () => {
      it('returns values to populate the fields with', () => {
        const appointment = appointmentFactory.build({
          appointmentTime: '2021-03-24T10:30:00Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
          appointmentDeliveryAddress: {
            firstAddressLine: 'Harmony Living Office, Room 4',
            secondAddressLine: '44 Bouverie Road',
            townOrCity: 'Blackpool',
            county: 'Lancashire',
            postCode: 'SY4 0RE',
          },
        })
        const presenter = new ScheduleAppointmentPresenter(referral, appointment)

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
          meetingMethod: { value: 'IN_PERSON_MEETING_OTHER', errorMessage: null },
          address: {
            value: {
              firstAddressLine: 'Harmony Living Office, Room 4',
              secondAddressLine: '44 Bouverie Road',
              townOrCity: 'Blackpool',
              county: 'Lancashire',
              postCode: 'SY4 0RE',
            },
            errors: {
              firstAddressLine: null,
              postcode: null,
            },
          },
        })
      })
    })
  })

  describe('backLinkHref', () => {
    describe('when overrideBackLinkHref is not provided to the constructor', () => {
      it('returns the URL of the intervention progress page', () => {
        const presenter = new ScheduleAppointmentPresenter(referral, null)

        expect(presenter.backLinkHref).toEqual(`/service-provider/referrals/${referral.id}/progress`)
      })
    })

    describe('when overrideBackLinkHref is provided to the constructor', () => {
      it('returns the overrideBacklinkHref', () => {
        const presenter = new ScheduleAppointmentPresenter(referral, null, null, null, null, null, '/example-href')

        expect(presenter.backLinkHref).toEqual('/example-href')
      })
    })
  })
})
