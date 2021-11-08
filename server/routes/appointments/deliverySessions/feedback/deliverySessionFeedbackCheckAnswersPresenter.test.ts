import DeliverySessionFeedbackCheckAnswersPresenter from './deliverySessionFeedbackCheckAnswersPresenter'
import actionPlanAppointmentFactory from '../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../testutils/factories/deliusServiceUser'
import AppointmentSummary from '../../appointmentSummary'

describe(DeliverySessionFeedbackCheckAnswersPresenter, () => {
  describe('text', () => {
    it('includes the title of the page', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const referralId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'

      const presenter = new DeliverySessionFeedbackCheckAnswersPresenter(
        appointment,
        serviceUser,
        referralId,
        new AppointmentSummary(appointment)
      )

      expect(presenter.text).toMatchObject({
        title: 'Confirm feedback',
      })
    })
  })

  describe('submitHref', () => {
    it('includes the action plan id and session number', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
      const serviceUser = deliusServiceUserFactory.build()
      const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

      const presenter = new DeliverySessionFeedbackCheckAnswersPresenter(
        appointment,
        serviceUser,
        referralId,
        new AppointmentSummary(appointment)
      )

      expect(presenter.submitHref).toEqual(
        `/service-provider/referral/${referralId}/session/${appointment.sessionNumber}/appointment/${appointment.id}/feedback/submit`
      )
    })
  })

  describe('backLinkHref', () => {
    describe('when the appointment was attended', () => {
      it('includes the referal id and link to the behaviour feedback page', () => {
        const attendedAppointments = [
          actionPlanAppointmentFactory.build({ sessionFeedback: { attendance: { attended: 'yes' } } }),
          actionPlanAppointmentFactory.build({ sessionFeedback: { attendance: { attended: 'late' } } }),
        ]

        const serviceUser = deliusServiceUserFactory.build()
        const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

        attendedAppointments.forEach(appointment => {
          const presenter = new DeliverySessionFeedbackCheckAnswersPresenter(
            appointment,
            serviceUser,
            referralId,
            new AppointmentSummary(appointment)
          )

          expect(presenter.backLinkHref).toEqual(
            `/service-provider/referral/${referralId}/session/${appointment.sessionNumber}/appointment/${appointment.id}/feedback/behaviour`
          )
        })
      })
    })

    describe('when the appointment was not attended', () => {
      it('includes the referal id and link to the attendance feedback page', () => {
        const appointment = actionPlanAppointmentFactory.build({ sessionFeedback: { attendance: { attended: 'no' } } })
        const serviceUser = deliusServiceUserFactory.build()
        const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

        const presenter = new DeliverySessionFeedbackCheckAnswersPresenter(
          appointment,
          serviceUser,
          referralId,
          new AppointmentSummary(appointment)
        )

        expect(presenter.backLinkHref).toEqual(
          `/service-provider/referral/${referralId}/session/${appointment.sessionNumber}/appointment/${appointment.id}/feedback/attendance`
        )
      })
    })
  })
})
