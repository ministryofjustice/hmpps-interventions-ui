import ActionPlanPostSessionFeedbackCheckAnswersPresenter from './actionPlanPostSessionFeedbackCheckAnswersPresenter'
import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import AppointmentSummary from '../../../appointmentSummary'

describe('ActionPlanPostSessionFeedbackCheckAnswersPresenter', () => {
  describe('text', () => {
    it('includes the title of the page', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'

      const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
        appointment,
        serviceUser,
        actionPlanId,
        new AppointmentSummary(appointment)
      )

      expect(presenter.text).toMatchObject({
        title: 'Confirm session feedback',
      })
    })
  })

  describe('submitHref', () => {
    describe('draftId is provided', () => {
      it('includes the action plan id and session number', () => {
        const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
        const serviceUser = deliusServiceUserFactory.build()
        const actionPlanId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

        const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
          appointment,
          serviceUser,
          actionPlanId,
          new AppointmentSummary(appointment),
          'draftId'
        )

        expect(presenter.submitHref).toEqual(
          '/service-provider/action-plan/77f0d8fc-9443-492c-b352-4cab66acbf3c/appointment/1/post-session-feedback/edit/draftId/submit'
        )
      })
    })

    describe('draftId is not provided', () => {
      it('includes the action plan id and session number', () => {
        const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
        const serviceUser = deliusServiceUserFactory.build()
        const actionPlanId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

        const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
          appointment,
          serviceUser,
          actionPlanId,
          new AppointmentSummary(appointment)
        )

        expect(presenter.submitHref).toEqual(
          '/service-provider/action-plan/77f0d8fc-9443-492c-b352-4cab66acbf3c/appointment/1/post-session-feedback/submit'
        )
      })
    })
  })

  describe('backLinkHref', () => {
    describe('draftId is provided', () => {
      describe('when the appointment was attended', () => {
        it('includes the referal id and link to the behaviour feedback page', () => {
          const attendedAppointments = [
            actionPlanAppointmentFactory.build({ appointmentFeedback: { attendanceFeedback: { attended: 'yes' } } }),
            actionPlanAppointmentFactory.build({ appointmentFeedback: { attendanceFeedback: { attended: 'yes' } } }),
          ]

          const serviceUser = deliusServiceUserFactory.build()
          const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

          attendedAppointments.forEach(appointment => {
            const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
              appointment,
              serviceUser,
              referralId,
              new AppointmentSummary(appointment),
              'draftId'
            )

            expect(presenter.backLinkHref).toEqual(
              '/service-provider/action-plan/77f0d8fc-9443-492c-b352-4cab66acbf3c/appointment/1/post-session-feedback/edit/draftId/no-session'
            )
          })
        })
      })

      describe('when the appointment was not attended', () => {
        it('includes the referal id and link to the attendance feedback page', () => {
          const appointment = actionPlanAppointmentFactory.build({
            appointmentFeedback: { attendanceFeedback: { attended: 'no' } },
          })
          const serviceUser = deliusServiceUserFactory.build()
          const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

          const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
            appointment,
            serviceUser,
            referralId,
            new AppointmentSummary(appointment),
            'draftId'
          )

          expect(presenter.backLinkHref).toEqual(
            '/service-provider/action-plan/77f0d8fc-9443-492c-b352-4cab66acbf3c/appointment/1/post-session-feedback/edit/draftId/no-session'
          )
        })
      })
    })
    describe('draftId is not provided', () => {
      describe('when the appointment was attended', () => {
        it('includes the referal id and link to the behaviour feedback page', () => {
          const attendedAppointments = [
            actionPlanAppointmentFactory.build({ appointmentFeedback: { attendanceFeedback: { attended: 'yes' } } }),
            actionPlanAppointmentFactory.build({ appointmentFeedback: { attendanceFeedback: { attended: 'yes' } } }),
          ]

          const serviceUser = deliusServiceUserFactory.build()
          const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

          attendedAppointments.forEach(appointment => {
            const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
              appointment,
              serviceUser,
              referralId,
              new AppointmentSummary(appointment)
            )

            expect(presenter.backLinkHref).toEqual(
              '/service-provider/action-plan/77f0d8fc-9443-492c-b352-4cab66acbf3c/appointment/1/post-session-feedback/no-session'
            )
          })
        })
      })

      describe('when the appointment was not attended', () => {
        it('includes the referal id and link to the attendance feedback page', () => {
          const appointment = actionPlanAppointmentFactory.build({
            appointmentFeedback: { attendanceFeedback: { attended: 'no' } },
          })
          const serviceUser = deliusServiceUserFactory.build()
          const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

          const presenter = new ActionPlanPostSessionFeedbackCheckAnswersPresenter(
            appointment,
            serviceUser,
            referralId,
            new AppointmentSummary(appointment)
          )

          expect(presenter.backLinkHref).toEqual(
            '/service-provider/action-plan/77f0d8fc-9443-492c-b352-4cab66acbf3c/appointment/1/post-session-feedback/no-session'
          )
        })
      })
    })
  })
})
