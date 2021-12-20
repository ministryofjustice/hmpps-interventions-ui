import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import ActionPlanSessionBehaviourFeedbackPresenter from './actionPlanSessionBehaviourFeedbackPresenter'

describe(ActionPlanSessionBehaviourFeedbackPresenter, () => {
  describe('backLinkHref', () => {
    describe('draftId is provided', () => {
      it('contains the link to the attendance page with the action plan id and session number', () => {
        const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 2 })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new ActionPlanSessionBehaviourFeedbackPresenter(
          appointment,
          serviceUser,
          'action-plan-id',
          null,
          null,
          'draftId'
        )

        expect(presenter.backLinkHref).toEqual(
          '/service-provider/action-plan/action-plan-id/appointment/2/post-session-feedback/edit/draftId/attendance'
        )
      })
    })

    describe('actionPlanId and sessionNumber is provided but draftId is not provided', () => {
      it('contains the link to the attendance page with the action plan id and session number', () => {
        const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 2 })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new ActionPlanSessionBehaviourFeedbackPresenter(appointment, serviceUser, 'action-plan-id')

        expect(presenter.backLinkHref).toEqual(
          '/service-provider/action-plan/action-plan-id/appointment/2/post-session-feedback/attendance'
        )
      })
    })

    describe('actionPlanId is not provided', () => {
      it('contains the link to the attendance page with the action plan id and session number', () => {
        const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 2 })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new ActionPlanSessionBehaviourFeedbackPresenter(appointment, serviceUser, null)

        expect(presenter.backLinkHref).toBeNull()
      })
    })
  })
})
