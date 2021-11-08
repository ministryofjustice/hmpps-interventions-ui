import DeliverySessionBehaviourFeedbackPresenter from './deliverySessionBehaviourFeedbackPresenter'
import actionPlanAppointmentFactory from '../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../testutils/factories/deliusServiceUser'

describe(DeliverySessionBehaviourFeedbackPresenter, () => {
  describe('backLinkHref', () => {
    it('contains the link to the attendance page with the action plan id and session number', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 2, id: 'appointment-id' })
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new DeliverySessionBehaviourFeedbackPresenter(appointment, serviceUser, 'referral-id')

      expect(presenter.backLinkHref).toEqual(
        '/service-provider/referral/referral-id/session/2/appointment/appointment-id/feedback/attendance'
      )
    })
  })
})
