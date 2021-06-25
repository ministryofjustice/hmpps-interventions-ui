import sentReferralFactory from '../../../testutils/factories/sentReferral'
import appointmentFactory from '../../../testutils/factories/appointment'
import SupplierAssessmentAppointmentPresenter from './supplierAssessmentAppointmentPresenter'
import { AppointmentDeliveryType } from '../../models/appointmentDeliveryType'

describe(SupplierAssessmentAppointmentPresenter, () => {
  const referral = sentReferralFactory.build()

  describe('summary', () => {
    it('contains the date and time of the appointment', () => {
      const appointment = appointmentFactory.build({
        appointmentTime: '2021-03-09T11:00:00Z',
        durationInMinutes: 60,
      })
      const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

      expect(presenter.summary.slice(0, 2)).toEqual([
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
        const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

        expect(presenter.summary[2]).toEqual({ key: 'Method', lines: [expectedDisplayValue] })
      })
    })

    describe('when the appointment does not have a delivery address', () => {
      it('does not contain a row for the address', () => {
        const appointment = appointmentFactory.build({ appointmentDeliveryAddress: null })
        const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

        expect(presenter.summary.map(row => row.key)).toEqual(['Date', 'Time', 'Method'])
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
        const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

        expect(presenter.summary[3]).toEqual({
          key: 'Address',
          lines: ['123 Fake Street', 'Fakesvillage', 'Manchester', 'Greater Manchester', 'N4 1HG'],
        })
      })

      describe('when the second address line is absent', () => {
        it('doesn’t contain a line for the second address line', () => {
          const appointment = appointmentFactory.build({
            appointmentDeliveryAddress: { ...address, secondAddressLine: null },
          })
          const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

          expect(presenter.summary[3]).toEqual({
            key: 'Address',
            lines: ['123 Fake Street', 'Manchester', 'Greater Manchester', 'N4 1HG'],
          })
        })
      })
    })
  })

  describe('actionLink', () => {
    describe('when there is not yet any feedback recorded for the appointment', () => {
      it('returns a link to the scheduling page', () => {
        const appointment = appointmentFactory.newlyBooked().build()
        const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

        expect(presenter.actionLink).toEqual({
          text: 'Change appointment details',
          href: `/service-provider/referrals/${referral.id}/supplier-assessment/schedule`,
        })
      })

      describe('when the readonly option is true', () => {
        it('returns null', () => {
          const appointment = appointmentFactory.newlyBooked().build()
          const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment, { readonly: true })

          expect(presenter.actionLink).toBeNull()
        })
      })
    })

    describe('when there is already feedback recorded for the appointment', () => {
      it('returns null', () => {
        const appointment = appointmentFactory.attended('yes').build()
        const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

        expect(presenter.actionLink).toBeNull()
      })
    })
  })

  describe('backLinkHref', () => {
    it('returns the URL of the intervention progress page', () => {
      const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointmentFactory.build())

      expect(presenter.backLinkHref).toEqual(`/service-provider/referrals/${referral.id}/progress`)
    })
  })
})
