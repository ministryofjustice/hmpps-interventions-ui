import appointmentFactory from '../../../../../../testutils/factories/appointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import InitialAssessmentBehaviourFeedbackPresenter from './initialAssessmentBehaviourFeedbackPresenter'

describe(InitialAssessmentBehaviourFeedbackPresenter, () => {
  describe('text', () => {
    it('contains the text for the title and questions to be displayed on the page', () => {
      const initialAssessmentAppointment = appointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new InitialAssessmentBehaviourFeedbackPresenter(
        initialAssessmentAppointment,
        serviceUser,
        'test-referral-id'
      )

      expect(presenter.text).toMatchObject({
        title: 'Add behaviour feedback',
        behaviourDescription: {
          question: `Describe Alex's behaviour in the assessment appointment`,
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

  describe('backLinkHref', () => {
    it('contains the link to the attendance page with the referral id', () => {
      const initialAssessmentAppointment = appointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new InitialAssessmentBehaviourFeedbackPresenter(
        initialAssessmentAppointment,
        serviceUser,
        'test-referral-id'
      )

      expect(presenter.backLinkHref).toEqual(
        '/service-provider/referrals/test-referral-id/supplier-assessment/post-assessment-feedback/attendance'
      )
    })
  })
})
