import ScheduleDeliverySessionPresenter from './scheduleDeliverySessionPresenter'
import actionPlanAppointmentFactory from '../../../../testutils/factories/actionPlanAppointment'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'
import AppointmentSummary from '../appointmentSummary'

describe(ScheduleDeliverySessionPresenter, () => {
  const referral = sentReferralFactory.build()

  // The rest of this class is tested in its superclass’s tests.

  describe('text.title', () => {
    it('contains the appointment number', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
      const presenter = new ScheduleDeliverySessionPresenter(
        referral,
        appointment,
        new AppointmentSummary(appointment),
        []
      )

      expect(presenter.text).toEqual({ title: 'Add session 1 details' })
    })
  })
})
