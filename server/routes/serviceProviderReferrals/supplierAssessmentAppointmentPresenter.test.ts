import sentReferralFactory from '../../../testutils/factories/sentReferral'
import appointmentFactory from '../../../testutils/factories/appointment'
import SupplierAssessmentAppointmentPresenter from './supplierAssessmentAppointmentPresenter'

describe(SupplierAssessmentAppointmentPresenter, () => {
  const referral = sentReferralFactory.build()

  describe('summary', () => {
    it('returns a summary of the appointment', () => {
      const appointment = appointmentFactory.build({
        appointmentTime: '2021-03-09T11:00:00Z',
        durationInMinutes: 60,
      })
      const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

      expect(presenter.summary).toEqual([
        { key: 'Date', lines: ['9 March 2021'] },
        { key: 'Time', lines: ['11:00am to 12:00pm'] },
      ])
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
    })

    describe('when there is already feedback recorded for the appointment', () => {
      it('returns null', () => {
        const appointment = appointmentFactory.attended('yes').build()
        const presenter = new SupplierAssessmentAppointmentPresenter(referral, appointment)

        expect(presenter.actionLink).toBeNull()
      })
    })
  })
})
