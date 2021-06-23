import EditSessionForm from './editSessionForm'
import TestUtils from '../../../testutils/testUtils'

describe('EditSessionForm', () => {
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
            'meeting-method': 'PHONE_CALL',
          })

          const data = await new EditSessionForm(request).data()

          expect(data.paramsForUpdate).toEqual({
            appointmentTime: '2021-09-12T12:05:00.000Z',
            durationInMinutes: 90,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentDeliveryAddress: null,
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
            'meeting-method': 'IN_PERSON_MEETING_OTHER',
            'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
            'method-other-location-address-line-2': '44 Bouverie Road',
            'method-other-location-address-town-or-city': 'Blackpool',
            'method-other-location-address-county': 'Lancashire',
            'method-other-location-address-postcode': 'SY4 0RE',
          })

          const data = await new EditSessionForm(request).data()

          expect(data.paramsForUpdate).toEqual({
            appointmentTime: '2021-09-12T12:05:00.000Z',
            durationInMinutes: 90,
            appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
            appointmentDeliveryAddress: {
              firstAddressLine: 'Harmony Living Office, Room 4',
              secondAddressLine: '44 Bouverie Road',
              townOrCity: 'Blackpool',
              county: 'Lancashire',
              postCode: 'SY4 0RE',
            },
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
              'meeting-method': 'IN_PERSON_MEETING_OTHER',
              'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
              'method-other-location-address-town-or-city': 'Blackpool',
              'method-other-location-address-county': 'Lancashire',
              'method-other-location-address-postcode': 'SY4 0RE',
            })

            const data = await new EditSessionForm(request).data()
            expect(data.paramsForUpdate).toEqual({
              appointmentTime: '2021-09-12T12:05:00.000Z',
              durationInMinutes: 90,
              appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
              appointmentDeliveryAddress: {
                firstAddressLine: 'Harmony Living Office, Room 4',
                secondAddressLine: '',
                townOrCity: 'Blackpool',
                county: 'Lancashire',
                postCode: 'SY4 0RE',
              },
            })
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

        const data = await new EditSessionForm(request).data()

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
              errorSummaryLinkedField: 'meeting-method',
              formFields: ['meeting-method'],
              message: 'Select a meeting method',
            },
          ],
        })
      })
    })
  })
})
