import initialAssessmentAppointmentFactory from '../../../../../../testutils/factories/initialAssessmentAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import InitialAssessmentAttendanceFeedbackPresenter from './initialAssessmentAttendanceFeedbackPresenter'
import AppointmentSummary from '../../../appointmentSummary'

describe(InitialAssessmentAttendanceFeedbackPresenter, () => {
  describe('text', () => {
    it('contains a title including the name of the service category and a subtitle, and the attendance questions', () => {
      const appointment = initialAssessmentAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const presenter = new InitialAssessmentAttendanceFeedbackPresenter(
        appointment,
        serviceUser,
        new AppointmentSummary(appointment)
      )

      expect(presenter.text).toMatchObject({
        title: 'Record appointment attendance',
        subTitle: 'The date and time of the appointment are a permanent record of where this person was.',
        attendanceQuestion: 'Did Alex River come to the appointment?',
        attendanceQuestionHint: 'Select one option',
        additionalAttendanceInformationLabel: "Add additional information about Alex's attendance:",
      })
    })
  })

  describe('backLinkHref', () => {
    describe('when a referral id is passed in', () => {
      it('is a link back to the Intervention Progress page', () => {
        const appointment = initialAssessmentAppointmentFactory.build()
        const serviceUser = deliusServiceUserFactory.build()
        const presenter = new InitialAssessmentAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment),
          'test-referral-id',
          null,
          null
        )

        expect(presenter.backLinkHref).toEqual('/service-provider/referrals/test-referral-id/progress')
      })
    })

    describe('when a referral id is not passed in', () => {
      it('is null', () => {
        const appointment = initialAssessmentAppointmentFactory.build()
        const serviceUser = deliusServiceUserFactory.build()
        const presenter = new InitialAssessmentAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment)
        )

        expect(presenter.backLinkHref).toEqual(null)
      })
    })
  })
})
