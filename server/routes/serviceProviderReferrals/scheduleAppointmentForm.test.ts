import MockDate from 'mockdate'
import ScheduleAppointmentForm from './scheduleAppointmentForm'
import TestUtils from '../../../testutils/testUtils'
import DeliusOfficeLocation from '../../models/deliusOfficeLocation'

describe(ScheduleAppointmentForm, () => {
  const deliusOfficeLocations: DeliusOfficeLocation[] = [
    {
      probationOfficeId: 76,
      name: 'Havering: Pioneer House',
      address: 'Pioneer House, North Street, Hornchurch, Essex, RM11 1QZ',
      probationRegionId: 'J',
      govUkURL: 'https://www.gov.uk/guidance/havering-pioneer-house',
      deliusCRSLocationId: 'CRS0001',
    },
  ]
  describe('data', () => {
    describe('with valid data', () => {
      describe('with a phone call appointment', () => {
        it('returns a paramsForUpdate with the completionDeadline key, an ISO-formatted date and phone call', async () => {
          const request = TestUtils.createRequest({
            'date-year': '2022',
            'date-month': '4',
            'date-day': '11',
            'time-hour': '1',
            'time-minute': '05',
            'time-part-of-day': 'pm',
            'duration-hours': '1',
            'duration-minutes': '30',
            'session-type': 'ONE_TO_ONE',
            'meeting-method': 'PHONE_CALL',
          })

          const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()

          expect(data.paramsForUpdate).toEqual({
            appointmentTime: '2022-04-11T12:05:00.000Z',
            durationInMinutes: 90,
            sessionType: 'ONE_TO_ONE',
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentDeliveryAddress: null,
            npsOfficeCode: null,
          })
        })
      })

      describe('with rescheduledReason and rescheduleRequestedBy', () => {
        it('returns a paramsForUpdate with the completionDeadline key, an ISO-formatted date, rescheduledReason and rescheduleRequestedBy', async () => {
          const request = TestUtils.createRequest({
            'date-year': '2022',
            'date-month': '4',
            'date-day': '11',
            'time-hour': '1',
            'time-minute': '05',
            'time-part-of-day': 'pm',
            'duration-hours': '1',
            'duration-minutes': '30',
            'session-type': 'ONE_TO_ONE',
            'meeting-method': 'PHONE_CALL',
            'rescheduled-reason': 'test reason',
            'reschedule-requested-by': 'Service Provider',
          })

          const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations, false, null, true).data()

          expect(data.paramsForUpdate).toEqual({
            appointmentTime: '2022-04-11T12:05:00.000Z',
            durationInMinutes: 90,
            sessionType: 'ONE_TO_ONE',
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentDeliveryAddress: null,
            npsOfficeCode: null,
            rescheduledReason: 'test reason',
            rescheduleRequestedBy: 'Service Provider',
          })
        })
      })

      describe('with an other locations appointment', () => {
        it('returns a paramsForUpdate with the completionDeadline key, an ISO-formatted date and phone call', async () => {
          const request = TestUtils.createRequest({
            'date-year': '2022',
            'date-month': '5',
            'date-day': '17',
            'time-hour': '1',
            'time-minute': '05',
            'time-part-of-day': 'pm',
            'duration-hours': '1',
            'duration-minutes': '30',
            'session-type': 'ONE_TO_ONE',
            'meeting-method': 'IN_PERSON_MEETING_OTHER',
            'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
            'method-other-location-address-line-2': '44 Bouverie Road',
            'method-other-location-address-town-or-city': 'Blackpool',
            'method-other-location-address-county': 'Lancashire',
            'method-other-location-address-postcode': 'SY4 0RE',
          })

          const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()

          expect(data.paramsForUpdate).toEqual({
            appointmentTime: '2022-05-17T12:05:00.000Z',
            durationInMinutes: 90,
            sessionType: 'ONE_TO_ONE',
            appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
            appointmentDeliveryAddress: {
              firstAddressLine: 'Harmony Living Office, Room 4',
              secondAddressLine: '44 Bouverie Road',
              townOrCity: 'Blackpool',
              county: 'Lancashire',
              postCode: 'SY4 0RE',
            },
            npsOfficeCode: null,
          })
        })

        describe('with a missing second address line', () => {
          it('returns a paramsForUpdate with the completionDeadline key, an ISO-formatted date and phone call', async () => {
            const request = TestUtils.createRequest({
              'date-year': '2022',
              'date-month': '5',
              'date-day': '17',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_OTHER',
              'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
              'method-other-location-address-town-or-city': 'Blackpool',
              'method-other-location-address-county': 'Lancashire',
              'method-other-location-address-postcode': 'SY4 0RE',
            })

            const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()
            expect(data.paramsForUpdate).toEqual({
              appointmentTime: '2022-05-17T12:05:00.000Z',
              durationInMinutes: 90,
              sessionType: 'ONE_TO_ONE',
              appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
              appointmentDeliveryAddress: {
                firstAddressLine: 'Harmony Living Office, Room 4',
                secondAddressLine: '',
                townOrCity: 'Blackpool',
                county: 'Lancashire',
                postCode: 'SY4 0RE',
              },
              npsOfficeCode: null,
            })
          })
        })
      })
      describe('with a delius office location appointment', () => {
        it('returns a valid appointment with an office location code', async () => {
          const request = TestUtils.createRequest({
            'date-year': '2022',
            'date-month': '5',
            'date-day': '24',
            'time-hour': '1',
            'time-minute': '05',
            'time-part-of-day': 'pm',
            'duration-hours': '1',
            'duration-minutes': '30',
            'session-type': 'ONE_TO_ONE',
            'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
            'delius-office-location-code': 'CRS0001',
          })

          const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()

          expect(data.paramsForUpdate).toEqual({
            appointmentTime: '2022-05-24T12:05:00.000Z',
            durationInMinutes: 90,
            sessionType: 'ONE_TO_ONE',
            appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
            appointmentDeliveryAddress: null,
            npsOfficeCode: 'CRS0001',
          })
        })
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

        const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()

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
            {
              errorSummaryLinkedField: 'session-type',
              formFields: ['session-type'],
              message: 'Select the session type',
            },
            {
              errorSummaryLinkedField: 'meeting-method',
              formFields: ['meeting-method'],
              message: 'Select a meeting method',
            },
          ],
        })
      })
      describe('with a delius office location appointment', () => {
        describe('having an empty office location selection', () => {
          it('returns an error message for missing office location', async () => {
            const request = TestUtils.createRequest({
              'date-year': '2022',
              'date-month': '3',
              'date-day': '1',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
              'delius-office-location-code': '',
            })

            const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()

            expect(data.error).toEqual({
              errors: [
                {
                  errorSummaryLinkedField: 'delius-office-location-code',
                  formFields: ['delius-office-location-code'],
                  message: 'Select an office',
                },
              ],
            })
          })
        })
        describe('having an invalid office location selection', () => {
          it('returns an error message for invalid office location', async () => {
            const request = TestUtils.createRequest({
              'date-year': '2022',
              'date-month': '3',
              'date-day': '1',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
              'delius-office-location-code': 'CRS0002',
            })

            const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()

            expect(data.error).toEqual({
              errors: [
                {
                  errorSummaryLinkedField: 'delius-office-location-code',
                  formFields: ['delius-office-location-code'],
                  message: 'Select an office from the list',
                },
              ],
            })
          })
        })
        describe('having an early date selection', () => {
          it('returns an error message for early appointment date', async () => {
            const request = TestUtils.createRequest({
              'date-year': '1999',
              'date-month': '04',
              'date-day': '11',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
              'delius-office-location-code': 'CRS0001',
            })

            const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations).data()

            expect(data.error).toEqual({
              errors: [
                {
                  errorSummaryLinkedField: 'date-year',
                  formFields: ['date-year'],
                  message: 'The session date must be a real date',
                },
              ],
            })
          })
        })
        describe('having no rescheduled reason when there is an existing appointment', () => {
          it('returns an error message for empty rescheduled reason', async () => {
            const request = TestUtils.createRequest({
              'date-year': '2022',
              'date-month': '3',
              'date-day': '1',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
              'delius-office-location-code': 'CRS0001',
              'rescheduled-reason': '',
              'reschedule-requested-by': 'Service Provider',
            })

            const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations, false, null, true).data()

            expect(data.error).toEqual({
              errors: [
                {
                  errorSummaryLinkedField: 'rescheduled-reason',
                  formFields: ['rescheduled-reason'],
                  message: 'Enter reason for changing appointment',
                },
              ],
            })
          })
        })
        describe('having no rescheduled reason when there is an existing appointment', () => {
          it('returns an error message for empty rescheduled reason', async () => {
            const request = TestUtils.createRequest({
              'date-year': '2022',
              'date-month': '3',
              'date-day': '1',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
              'delius-office-location-code': 'CRS0001',
              'rescheduled-reason': 'test reason',
              'reschedule-requested-by': '',
            })

            const data = await new ScheduleAppointmentForm(request, deliusOfficeLocations, false, null, true).data()

            expect(data.error).toEqual({
              errors: [
                {
                  errorSummaryLinkedField: 'reschedule-requested-by',
                  formFields: ['reschedule-requested-by'],
                  message: 'Select who requested the appointment change',
                },
              ],
            })
          })
        })
        describe('having a late date selection', () => {
          it('returns an error message for late appointment date', async () => {
            MockDate.set(new Date(2022, 2, 1))

            const request = TestUtils.createRequest({
              'date-year': '3000',
              'date-month': '11',
              'date-day': '1',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
              'delius-office-location-code': 'CRS0001',
            })

            const data = await new ScheduleAppointmentForm(
              request,
              deliusOfficeLocations,
              false,
              '2022-01-10T09:38:07.827Z'
            ).data()

            expect(data.error).toEqual({
              errors: [
                {
                  errorSummaryLinkedField: 'date-day',
                  formFields: ['date-day'],
                  message: 'Date must be no later than 1 September 2022',
                },
              ],
            })
          })
        })
        describe('having an early date selection', () => {
          it('returns an error message for early appointment date', async () => {
            const request = TestUtils.createRequest({
              'date-year': '2010',
              'date-month': '10',
              'date-day': '11',
              'time-hour': '1',
              'time-minute': '05',
              'time-part-of-day': 'pm',
              'duration-hours': '1',
              'duration-minutes': '30',
              'session-type': 'ONE_TO_ONE',
              'meeting-method': 'IN_PERSON_MEETING_PROBATION_OFFICE',
              'delius-office-location-code': 'CRS0001',
            })

            const data = await new ScheduleAppointmentForm(
              request,
              deliusOfficeLocations,
              false,
              '2022-01-10T09:38:07.827Z'
            ).data()

            expect(data.error).toEqual({
              errors: [
                {
                  errorSummaryLinkedField: 'date-day',
                  formFields: ['date-day'],
                  message: 'Date must be no earlier than 10 January 2022',
                },
              ],
            })
          })
        })
      })
    })
  })
})
