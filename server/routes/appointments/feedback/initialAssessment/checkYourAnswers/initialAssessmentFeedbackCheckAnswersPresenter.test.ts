import InitialAssessmentFeedbackCheckAnswersPresenter from './initialAssessmentFeedbackCheckAnswersPresenter'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import initialAssessmentAppointmentFactory from '../../../../../../testutils/factories/initialAssessmentAppointment'
import AppointmentSummary from '../../../appointmentSummary'

describe(InitialAssessmentFeedbackCheckAnswersPresenter, () => {
  describe('submitHref', () => {
    it('includes the referral id', () => {
      const appointment = initialAssessmentAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

      const presenter = new InitialAssessmentFeedbackCheckAnswersPresenter(
        appointment,
        serviceUser,
        referralId,
        new AppointmentSummary(appointment)
      )

      expect(presenter.submitHref).toEqual(
        '/service-provider/referrals/77f0d8fc-9443-492c-b352-4cab66acbf3c/supplier-assessment/post-assessment-feedback/submit'
      )
    })
  })

  describe('backLinkHref', () => {
    describe('when the appointment was attended', () => {
      it('includes the referal id and link to the behaviour feedback page', () => {
        const attendedAppointments = [
          initialAssessmentAppointmentFactory.build({ sessionFeedback: { attendance: { attended: 'yes' } } }),
          initialAssessmentAppointmentFactory.build({ sessionFeedback: { attendance: { attended: 'late' } } }),
        ]

        const serviceUser = deliusServiceUserFactory.build()
        const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

        attendedAppointments.forEach(appointment => {
          const presenter = new InitialAssessmentFeedbackCheckAnswersPresenter(
            appointment,
            serviceUser,
            referralId,
            new AppointmentSummary(appointment)
          )

          expect(presenter.backLinkHref).toEqual(
            '/service-provider/referrals/77f0d8fc-9443-492c-b352-4cab66acbf3c/supplier-assessment/post-assessment-feedback/behaviour'
          )
        })
      })
    })

    describe('when the appointment was not attended', () => {
      it('includes the referal id and link to the attendance feedback page', () => {
        const appointment = initialAssessmentAppointmentFactory.build({
          sessionFeedback: { attendance: { attended: 'no' } },
        })
        const serviceUser = deliusServiceUserFactory.build()
        const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

        const presenter = new InitialAssessmentFeedbackCheckAnswersPresenter(
          appointment,
          serviceUser,
          referralId,
          new AppointmentSummary(appointment)
        )

        expect(presenter.backLinkHref).toEqual(
          '/service-provider/referrals/77f0d8fc-9443-492c-b352-4cab66acbf3c/supplier-assessment/post-assessment-feedback/attendance'
        )
      })
    })
  })
})
