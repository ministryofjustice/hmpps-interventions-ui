import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import { AppointmentDeliveryType } from '../../models/appointmentDeliveryType'
import AppointmentSummary from './appointmentSummary'
import DeliusOfficeLocation from '../../models/deliusOfficeLocation'

describe(AppointmentSummary, () => {
  describe('appointmentDetails', () => {
    describe('with empty values', () => {
      it('should show an empty list without throwing any error', () => {
        const emptyAppointment = initialAssessmentAppointmentFactory.build({
          appointmentTime: null,
          durationInMinutes: null,
          sessionType: null,
          appointmentDeliveryType: null,
        })
        const summaryComponent = new AppointmentSummary(emptyAppointment, null)

        expect(summaryComponent.appointmentSummaryList).toEqual([])
      })
    })
    it('contains the date and time of the appointment and it is capitalized', () => {
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-03-09T12:00:00Z',
        durationInMinutes: 60,
      })
      const summaryComponent = new AppointmentSummary(appointment, null)

      expect(summaryComponent.appointmentSummaryList.slice(0, 2)).toEqual([
        { key: 'Date', lines: ['9 March 2021'] },
        { key: 'Time', lines: ['Midday to 1:00pm'] },
      ])
    })

    const deliveryTypesTable: [string, AppointmentDeliveryType, string][] = [
      ['phone call appointment', 'PHONE_CALL', 'Phone call'],
      ['video call appointment', 'VIDEO_CALL', 'Video call'],
      [
        'in-person appointment in a probation office',
        'IN_PERSON_MEETING_PROBATION_OFFICE',
        'In-person meeting (probation office)',
      ],
      ['in-person appointment in some other location', 'IN_PERSON_MEETING_OTHER', 'In-person meeting'],
    ]
    describe.each(deliveryTypesTable)('for a %s', (_, deliveryType, expectedDisplayValue) => {
      it('contains the method of the appointment', () => {
        const appointment = initialAssessmentAppointmentFactory.build({ appointmentDeliveryType: deliveryType })
        const summaryComponent = new AppointmentSummary(appointment, null)

        expect(summaryComponent.appointmentSummaryList[2]).toEqual({ key: 'Method', lines: [expectedDisplayValue] })
      })
    })

    describe('when the feedback submitted case worker is provided', () => {
      it('it is included in summary list', () => {
        const appointment = initialAssessmentAppointmentFactory.build()
        const summaryComponent = new AppointmentSummary(
          appointment,
          null,
          null,
          hmppsAuthUserFactory.build({
            firstName: 'firstName',
            lastName: 'lastName',
            email: 'email',
          })
        )

        expect(summaryComponent.appointmentSummaryList[0]).toMatchObject({
          key: 'Feedback submitted by',
          lines: [
            {
              firstName: 'firstName',
              lastName: 'lastName',
              email: 'email',
            },
          ],
        })
      })
    })

    describe('when the assigned case worker is provided', () => {
      it('it is included in summary list', () => {
        const appointment = initialAssessmentAppointmentFactory.build()
        const summaryComponent = new AppointmentSummary(
          appointment,
          hmppsAuthUserFactory.build({
            firstName: 'firstName',
            lastName: 'lastName',
            email: 'email',
          })
        )

        expect(summaryComponent.appointmentSummaryList[0]).toMatchObject({
          key: 'Current caseworker',
          lines: [
            {
              firstName: 'firstName',
              lastName: 'lastName',
              email: 'email',
            },
          ],
        })
      })
    })

    describe('when the appointment does not have a delivery address', () => {
      it('does not contain a row for the address', () => {
        const appointment = initialAssessmentAppointmentFactory.build({ appointmentDeliveryAddress: null })
        const summaryComponent = new AppointmentSummary(appointment, null)

        expect(summaryComponent.appointmentSummaryList.map(row => row.key)).toEqual(['Date', 'Time', 'Method'])
      })
    })

    describe('when the appointment has an in-person meeting other address', () => {
      const address = {
        firstAddressLine: '123 Fake Street',
        secondAddressLine: 'Fakesvillage',
        townOrCity: 'Manchester',
        county: 'Greater Manchester',
        postCode: 'N4 1HG',
      }

      it('contains the address', () => {
        const appointment = initialAssessmentAppointmentFactory.build({
          appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
          appointmentDeliveryAddress: address,
        })
        const summaryComponent = new AppointmentSummary(appointment, null)

        expect(summaryComponent.appointmentSummaryList[3]).toEqual({
          key: 'Address',
          lines: ['123 Fake Street', 'Fakesvillage', 'Manchester', 'Greater Manchester', 'N4 1HG'],
        })
      })

      describe('when the second address line is absent', () => {
        it('doesn’t contain a line for the second address line', () => {
          const appointment = initialAssessmentAppointmentFactory.build({
            appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
            appointmentDeliveryAddress: { ...address, secondAddressLine: null },
          })
          const summaryComponent = new AppointmentSummary(appointment, null)

          expect(summaryComponent.appointmentSummaryList[3]).toEqual({
            key: 'Address',
            lines: ['123 Fake Street', 'Manchester', 'Greater Manchester', 'N4 1HG'],
          })
        })
      })
    })
    describe('when the appointment has an in-person meeting probation office address', () => {
      const deliusOfficeLocation: DeliusOfficeLocation = {
        probationOfficeId: 1,
        name: 'name',
        address: 'address line 1,address line 2,address line 3',
        probationRegionId: 'probationRegionId',
        govUkURL: 'govUkURL',
        deliusCRSLocationId: 'deliusCRSLocationId',
      }

      it('contains the address', () => {
        const appointment = initialAssessmentAppointmentFactory.build({
          appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
          npsOfficeCode: 'NPS_CODE',
        })
        const summaryComponent = new AppointmentSummary(appointment, null, deliusOfficeLocation)

        expect(summaryComponent.appointmentSummaryList[3]).toEqual({
          key: 'Address',
          lines: ['name', 'address line 1', 'address line 2', 'address line 3'],
        })
      })
    })
  })
})
