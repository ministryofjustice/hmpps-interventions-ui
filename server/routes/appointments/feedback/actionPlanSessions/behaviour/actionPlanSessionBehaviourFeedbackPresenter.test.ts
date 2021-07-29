import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import ActionPlanSessionBehaviourFeedbackPresenter from './actionPlanSessionBehaviourFeedbackPresenter'

describe(ActionPlanSessionBehaviourFeedbackPresenter, () => {
  describe('text', () => {
    it('contains the text for the title and questions to be displayed on the page', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new ActionPlanSessionBehaviourFeedbackPresenter(appointment, serviceUser)

      expect(presenter.text).toMatchObject({
        title: 'Add behaviour feedback',
        behaviourDescription: {
          question: `Describe Alex's behaviour in this session`,
          hint: 'For example, consider how well-engaged they were and what their body language was like.',
        },
        notifyProbationPractitioner: {
          question: 'If you described poor behaviour, do you want to notify the probation practitioner?',
          explanation: 'If you select yes, the probation practitioner will be notified by email.',
          hint: 'Select one option',
        },
      })
    })
  })
})
