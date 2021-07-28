import appointmentFactory from '../../../testutils/factories/appointment'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import { AppointmentDeliveryType } from '../../models/appointmentDeliveryType'
import AppointmentSummary from './appointmentSummary'

describe(AppointmentSummary, () => {
  describe('appointmentDetails', () => {
    it('contains the date and time of the appointment', () => {
      const appointment = appointmentFactory.build({
        appointmentTime: '2021-03-09T11:00:00Z',
        durationInMinutes: 60,
      })
      const summaryComponent = new AppointmentSummary(appointment, null)

      expect(summaryComponent.appointmentSummaryList.slice(0, 2)).toEqual([
        { key: 'Date', lines: ['9 March 2021'] },
        { key: 'Time', lines: ['11:00am to 12:00pm'] },
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
        const appointment = appointmentFactory.build({ appointmentDeliveryType: deliveryType })
        const summaryComponent = new AppointmentSummary(appointment, null)

        expect(summaryComponent.appointmentSummaryList[2]).toEqual({ key: 'Method', lines: [expectedDisplayValue] })
      })
    })

    describe('when the assigned case worker is provided', () => {
      it('contains the name of the referral’s assignee', () => {
        const appointment = appointmentFactory.build()
        const assignee = hmppsAuthUserFactory.build({ firstName: 'Liam', lastName: 'Johnson' })
        const summaryComponent = new AppointmentSummary(appointment, assignee)

        expect(summaryComponent.appointmentSummaryList[0]).toEqual({ key: 'Caseworker', lines: ['Liam Johnson'] })
      })
    })

    describe('when the appointment does not have a delivery address', () => {
      it('does not contain a row for the address', () => {
        const appointment = appointmentFactory.build({ appointmentDeliveryAddress: null })
        const summaryComponent = new AppointmentSummary(appointment, null)

        expect(summaryComponent.appointmentSummaryList.map(row => row.key)).toEqual(['Date', 'Time', 'Method'])
      })
    })

    describe('when the appointment has a delivery address', () => {
      const address = {
        firstAddressLine: '123 Fake Street',
        secondAddressLine: 'Fakesvillage',
        townOrCity: 'Manchester',
        county: 'Greater Manchester',
        postCode: 'N4 1HG',
      }

      it('contains the address', () => {
        const appointment = appointmentFactory.build({
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
          const appointment = appointmentFactory.build({
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
  })
})
