import appointmentFactory from '../../../../../../../testutils/factories/appointment'
import deliusServiceUserFactory from '../../../../../../../testutils/factories/deliusServiceUser'
import InitialAssessmentAttendanceFeedbackPresenter from './initialAssessmentAttendanceFeedbackPresenter'

describe(InitialAssessmentAttendanceFeedbackPresenter, () => {
  describe('text', () => {
    it('contains a title including the name of the service category and a subtitle, and the attendance questions', () => {
      const appointment = appointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new InitialAssessmentAttendanceFeedbackPresenter(appointment, serviceUser)

      expect(presenter.text).toMatchObject({
        title: 'Add feedback',
        subTitle: 'Appointment details',
        attendanceQuestion: 'Did Alex attend the initial assessment appointment?',
        attendanceQuestionHint: 'Select one option',
        additionalAttendanceInformationLabel: "Add additional information about Alex's attendance:",
      })
    })
  })
})
