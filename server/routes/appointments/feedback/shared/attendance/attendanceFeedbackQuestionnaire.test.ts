import initialAssessmentAppointment from '../../../../../../testutils/factories/initialAssessmentAppointment'
import deliusServiceUser from '../../../../../../testutils/factories/deliusServiceUser'
import actionPlanAppointment from '../../../../../../testutils/factories/actionPlanAppointment'
import AttendanceFeedbackQuestionnaire from './attendanceFeedbackQuestionnaire'

describe(AttendanceFeedbackQuestionnaire, () => {
  describe('attendanceQuestion', () => {
    describe('when the appointment is an initial assessment', () => {
      it('should produce a question specific to initial assessment', () => {
        const questionnaire = new AttendanceFeedbackQuestionnaire(
          initialAssessmentAppointment.build(),
          deliusServiceUser.build({ firstName: 'Alex' })
        )
        expect(questionnaire.attendanceQuestion.text).toEqual('Did Alex attend the initial assessment appointment?')
      })
    })

    describe('when the appointment is an action plan session', () => {
      it('should produce a question specific to action plan session', () => {
        const questionnaire = new AttendanceFeedbackQuestionnaire(
          actionPlanAppointment.build({ appointmentDeliveryType: 'PHONE_CALL' }),
          deliusServiceUser.build({ firstName: 'Alex' })
        )
        expect(questionnaire.attendanceQuestion.text).toEqual('Did Alex join this phone call?')
      })
    })
  })
})
