import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import BehaviourFeedbackInputsPresenter from './behaviourFeedbackInputsPresenter'

describe(BehaviourFeedbackInputsPresenter, () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const presenter = new BehaviourFeedbackInputsPresenter(appointment)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const appointment = actionPlanAppointmentFactory.build()

        const presenter = new BehaviourFeedbackInputsPresenter(appointment, {
          errors: [
            {
              formFields: ['behaviour-description'],
              errorSummaryLinkedField: 'behaviour-description',
              message: 'behaviour msg',
            },
            {
              formFields: ['notify-probation-practitioner'],
              errorSummaryLinkedField: 'notify-probation-practitioner',
              message: 'notify pp msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'behaviour-description', message: 'behaviour msg' },
          { field: 'notify-probation-practitioner', message: 'notify pp msg' },
        ])
      })
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
            const presenter = new BehaviourFeedbackInputsPresenter(appointment)

            expect(presenter.fields.behaviourDescription.value).toEqual('Alex was well behaved')
          })
        })

        describe('when the appointment has no value for behaviourDescription', () => {
          it('sets the value to an empty string', () => {
            const appointment = actionPlanAppointmentFactory.build({
              sessionFeedback: {
                behaviour: { behaviourDescription: undefined },
              },
            })
            const presenter = new BehaviourFeedbackInputsPresenter(appointment)

            expect(presenter.fields.behaviourDescription.value).toEqual('')
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
          const presenter = new BehaviourFeedbackInputsPresenter(appointment, null, {
            'behaviour-description': 'Alex misbehaved during the session',
          })

          expect(presenter.fields.behaviourDescription.value).toEqual('Alex misbehaved during the session')
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

            const presenter = new BehaviourFeedbackInputsPresenter(appointment)

            expect(presenter.fields.notifyProbationPractitioner.value).toEqual(false)
          })
        })

        describe('when the appointment has no value for notifyProbationPractitioner', () => {
          it('sets the value to null', () => {
            const appointment = actionPlanAppointmentFactory.build({
              sessionFeedback: {
                behaviour: { behaviourDescription: undefined },
              },
            })

            const presenter = new BehaviourFeedbackInputsPresenter(appointment)

            expect(presenter.fields.notifyProbationPractitioner.value).toEqual(null)
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
          const presenter = new BehaviourFeedbackInputsPresenter(appointment, null, {
            'behaviour-description': 'Alex misbehaved during the session',
            'notify-probation-practitioner': 'yes',
          })

          expect(presenter.fields.notifyProbationPractitioner.value).toEqual(true)
        })
      })
    })

    describe('errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const presenter = new BehaviourFeedbackInputsPresenter(appointment, {
          errors: [
            {
              formFields: ['behaviour-description'],
              errorSummaryLinkedField: 'behaviour-description',
              message: 'behaviour msg',
            },
            {
              formFields: ['notify-probation-practitioner'],
              errorSummaryLinkedField: 'notify-probation-practitioner',
              message: 'notify pp msg',
            },
          ],
        })

        expect(presenter.fields.behaviourDescription.errorMessage).toEqual('behaviour msg')
        expect(presenter.fields.notifyProbationPractitioner.errorMessage).toEqual('notify pp msg')
      })
    })
  })
})
