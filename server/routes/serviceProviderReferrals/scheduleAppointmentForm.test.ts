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
            'date-year': '2021',
            'date-month': '09',
            'date-day': '12',
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
            appointmentTime: '2021-09-12T12:05:00.000Z',
            durationInMinutes: 90,
            sessionType: 'ONE_TO_ONE',
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentDeliveryAddress: null,
            npsOfficeCode: null,
          })
        })
      })

      describe('with an other locations appointment', () => {
        it('returns a paramsForUpdate with the completionDeadline key, an ISO-formatted date and phone call', async () => {
          const request = TestUtils.createRequest({
            'date-year': '2021',
            'date-month': '09',
            'date-day': '12',
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
            appointmentTime: '2021-09-12T12:05:00.000Z',
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
              'date-year': '2021',
              'date-month': '09',
              'date-day': '12',
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
              appointmentTime: '2021-09-12T12:05:00.000Z',
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
            'date-year': '2021',
            'date-month': '09',
            'date-day': '12',
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
            appointmentTime: '2021-09-12T12:05:00.000Z',
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
              'date-year': '2021',
              'date-month': '09',
              'date-day': '12',
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
              'date-year': '2021',
              'date-month': '09',
              'date-day': '12',
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
      })
    })
  })
})
