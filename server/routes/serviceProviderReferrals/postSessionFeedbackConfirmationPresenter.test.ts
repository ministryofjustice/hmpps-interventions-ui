import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointment from '../../../testutils/factories/actionPlanAppointment'
import PostSessionFeedbackConfirmationPresenter from './postSessionFeedbackConfirmationPresenter'

describe(PostSessionFeedbackConfirmationPresenter, () => {
  describe('progressHref', () => {
    it('returns the relative URL of the service provider referral progress page', () => {
      const actionPlan = actionPlanFactory.build({ referralId: '9c84b308-2ebb-427a-9b9f-c4da06f5e7c3' })
      const appointment = actionPlanAppointment.build({
        sessionNumber: 1,
        sessionFeedback: {
          attendance: {
            attended: 'yes',
          },
        },
      })
      const presenter = new PostSessionFeedbackConfirmationPresenter(actionPlan, appointment)
      expect(presenter.progressHref).toEqual(
        `/service-provider/referrals/9c84b308-2ebb-427a-9b9f-c4da06f5e7c3/progress`
      )
    })
  })

  describe('what happens next text', () => {
    describe('when the service user attended the session', () => {
      describe('and there is a subsequent session scheduled', () => {
        it('specifies the date of the subsequent session', () => {
          const appointments = [
            actionPlanAppointment.build({
              sessionNumber: 1,
              sessionFeedback: {
                attendance: {
                  attended: 'yes',
                },
              },
            }),
            actionPlanAppointment.build({
              appointmentTime: '2021-03-31T10:50:10.790Z',
              durationInMinutes: 60,
              sessionNumber: 2,
            }),
          ]
          const actionPlan = actionPlanFactory.build({ numberOfSessions: 2 })
          const presenter = new PostSessionFeedbackConfirmationPresenter(actionPlan, appointments[0], appointments[1])

          expect(presenter.text.whatHappensNext).toEqual(
            'You can now deliver the next session scheduled for 31 Mar 2021.'
          )
        })
      })

      describe('and there are no subsequent sessions scheduled', () => {
        it('informs the service provider that the probation practitioner has been sent a copy of the session feedback form', () => {
          const appointment = actionPlanAppointment.build({
            sessionNumber: 1,
            sessionFeedback: {
              attendance: {
                attended: 'yes',
              },
            },
          })

          const actionPlan = actionPlanFactory.build({ numberOfSessions: 2 })
          const presenter = new PostSessionFeedbackConfirmationPresenter(actionPlan, appointment)

          expect(presenter.text.whatHappensNext).toEqual(
            'The probation practitioner has been sent a copy of the session feedback form.'
          )
        })
      })

      describe('and there is not date for a subsequent session', () => {
        it('informs the service provider that the probation practitioner has been sent a copy of the session feedback form', () => {
          const appointments = [
            actionPlanAppointment.build({
              sessionNumber: 1,
              sessionFeedback: {
                attendance: {
                  attended: 'yes',
                },
              },
            }),
            actionPlanAppointment.build({
              appointmentTime: '',
              durationInMinutes: 60,
              sessionNumber: 2,
            }),
          ]

          const actionPlan = actionPlanFactory.build({ numberOfSessions: 2 })
          const presenter = new PostSessionFeedbackConfirmationPresenter(actionPlan, appointments[0], appointments[1])

          expect(presenter.text.whatHappensNext).toEqual(
            'The probation practitioner has been sent a copy of the session feedback form.'
          )
        })
      })

      describe('and this is the final session', () => {
        it('reminds the service provider to submit their end of service report within 5 days', () => {
          const appointment = actionPlanAppointment.build({
            sessionNumber: 2,
            sessionFeedback: {
              attendance: {
                attended: 'yes',
              },
            },
          })

          const actionPlan = actionPlanFactory.build({ numberOfSessions: 2 })
          const presenter = new PostSessionFeedbackConfirmationPresenter(actionPlan, appointment)

          expect(presenter.text.whatHappensNext).toEqual(
            'Please submit the end of service report within 5 working days.'
          )
        })
      })
    })
  })
})
