import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import PostSessionBehaviourFeedbackPresenter from './postSessionBehaviourFeedbackPresenter'

describe(PostSessionBehaviourFeedbackPresenter, () => {
  describe('text', () => {
    it('contains the text for the title and questions to be displayed on the page', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser)

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

  describe('serviceUserBannerPresenter', () => {
    it('is instantiated with the service user', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser)

      expect(presenter.serviceUserBannerPresenter).toBeDefined()
    })
  })

  describe('fields', () => {
    describe('behaviourDescriptionValue', () => {
      describe('when there is no user input data', () => {
        describe('when the appointment already has behaviourDescription set', () => {
          it('uses that value as the value attribute', () => {
            const appointment = actionPlanAppointmentFactory.build({
              sessionFeedback: {
                behaviour: { behaviourDescription: 'Alex was well behaved', notifyProbationPractitioner: false },
              },
            })
            const serviceUser = deliusServiceUserFactory.build()
            const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser)

            expect(presenter.fields.behaviourDescriptionValue).toEqual('Alex was well behaved')
          })
        })

        describe('when the appointment has no value for behaviourDescription', () => {
          it('sets the value to an empty string', () => {
            const appointment = actionPlanAppointmentFactory.build({
              sessionFeedback: {
                behaviour: { behaviourDescription: undefined },
              },
            })
            const serviceUser = deliusServiceUserFactory.build()
            const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser)

            expect(presenter.fields.behaviourDescriptionValue).toEqual('')
          })
        })
      })

      describe('when there is user input data', () => {
        it('uses the user input data as the value attribute', () => {
          const appointment = actionPlanAppointmentFactory.build({
            sessionFeedback: {
              behaviour: { behaviourDescription: 'Alex was well behaved', notifyProbationPractitioner: false },
            },
          })
          const serviceUser = deliusServiceUserFactory.build()
          const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser, {
            'behaviour-description': 'Alex misbehaved during the session',
          })

          expect(presenter.fields.behaviourDescriptionValue).toEqual('Alex misbehaved during the session')
        })
      })
    })

    describe('notifyProbationPractitioner', () => {
      describe('when there is no user input data', () => {
        describe('when the appointment already has a value selected for notifying the probation practitioner', () => {
          it('uses the pre-selected value', () => {
            const appointment = actionPlanAppointmentFactory.build({
              sessionFeedback: {
                behaviour: { behaviourDescription: 'Alex was well behaved', notifyProbationPractitioner: false },
              },
            })

            const serviceUser = deliusServiceUserFactory.build()
            const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser)

            expect(presenter.fields.notifyProbationPractitioner).toEqual(false)
          })
        })

        describe('when the appointment has no value for notifyProbationPractitioner', () => {
          it('sets the value to null', () => {
            const appointment = actionPlanAppointmentFactory.build({
              sessionFeedback: {
                behaviour: { behaviourDescription: undefined },
              },
            })

            const serviceUser = deliusServiceUserFactory.build()
            const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser)

            expect(presenter.fields.notifyProbationPractitioner).toEqual(null)
          })
        })
      })

      describe('when there is user input data', () => {
        it('uses the user input data as the value attribute', () => {
          const appointment = actionPlanAppointmentFactory.build({
            sessionFeedback: {
              behaviour: { behaviourDescription: 'Alex was well behaved', notifyProbationPractitioner: false },
            },
          })
          const serviceUser = deliusServiceUserFactory.build()
          const presenter = new PostSessionBehaviourFeedbackPresenter(appointment, serviceUser, {
            'behaviour-description': 'Alex misbehaved during the session',
            'notify-probation-practitioner': 'yes',
          })

          expect(presenter.fields.notifyProbationPractitioner).toEqual(true)
        })
      })
    })
  })
})
