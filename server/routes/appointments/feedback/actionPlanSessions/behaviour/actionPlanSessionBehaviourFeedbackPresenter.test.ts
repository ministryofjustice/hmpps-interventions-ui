import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import ActionPlanSessionBehaviourFeedbackPresenter from './actionPlanSessionBehaviourFeedbackPresenter'

describe(ActionPlanSessionBehaviourFeedbackPresenter, () => {
  describe('backLinkHref', () => {
    it('contains the link to the attendance page with the action plan id and session number', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 2 })
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new ActionPlanSessionBehaviourFeedbackPresenter(appointment, serviceUser, 'action-plan-id')

      expect(presenter.backLinkHref).toEqual(
        '/service-provider/action-plan/action-plan-id/appointment/2/post-session-feedback/attendance'
      )
    })
  })
})
