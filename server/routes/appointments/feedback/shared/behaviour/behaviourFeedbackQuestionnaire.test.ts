import BehaviourFeedbackQuestionnaire from './behaviourFeedbackQuestionnaire'
import initialAssessmentAppointment from '../../../../../../testutils/factories/initialAssessmentAppointment'
import deliusServiceUser from '../../../../../../testutils/factories/deliusServiceUser'
import actionPlanAppointment from '../../../../../../testutils/factories/actionPlanAppointment'

describe(BehaviourFeedbackQuestionnaire, () => {
  describe('behaviourQuestion', () => {
    describe('when the appointment is an initial assessment', () => {
      it('should produce a question specific to initial assessment', () => {
        const questionnaire = new BehaviourFeedbackQuestionnaire(
          initialAssessmentAppointment.build(),
          deliusServiceUser.build({ firstName: 'Alex' })
        )
        expect(questionnaire.behaviourQuestion.text).toEqual("Describe Alex's behaviour in the assessment appointment")
      })
    })

    describe('when the appointment is an action plan session', () => {
      it('should produce a question specific to action plan session', () => {
        const questionnaire = new BehaviourFeedbackQuestionnaire(
          actionPlanAppointment.build(),
          deliusServiceUser.build({ firstName: 'Alex' })
        )
        expect(questionnaire.behaviourQuestion.text).toEqual("Describe Alex's behaviour in this session")
      })
    })
  })
})
