import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import SessionFeedbackInputsPresenter from './sessionFeedbackInputsPresenter'

describe(SessionFeedbackInputsPresenter, () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const presenter = new SessionFeedbackInputsPresenter(appointment)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const appointment = actionPlanAppointmentFactory.build()

        const presenter = new SessionFeedbackInputsPresenter(appointment, {
          errors: [
            {
              formFields: ['session-summary'],
              errorSummaryLinkedField: 'session-summary',
              message: 'summary error msg',
            },
            {
              formFields: ['session-response'],
              errorSummaryLinkedField: 'session-response',
              message: 'response error msg',
            },
            {
              formFields: ['session-concerns'],
              errorSummaryLinkedField: 'session-concerns',
              message: 'concerns error msg',
            },
            {
              formFields: ['notify-probation-practitioner'],
              errorSummaryLinkedField: 'notify-probation-practitioner',
              message: 'notify pp msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'session-summary', message: 'summary error msg' },
          { field: 'session-response', message: 'response error msg' },
          { field: 'session-concerns', message: 'concerns error msg' },
          { field: 'notify-probation-practitioner', message: 'notify pp msg' },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('session feedback values', () => {
      describe('when there is no user input data', () => {
        describe('when the appointment already has sessionSummary set', () => {
          it('uses that value as the value attribute', () => {
            const appointment = actionPlanAppointmentFactory.build({
              appointmentFeedback: {
                sessionFeedback: { sessionSummary: 'Discussed accommodation', notifyProbationPractitioner: false },
              },
            })
            const presenter = new SessionFeedbackInputsPresenter(appointment)

            expect(presenter.fields.sessionSummary.value).toEqual('Discussed accommodation')
          })
        })

        describe('when the appointment has no value for sessionConcerns', () => {
          it('sets the value to an empty string', () => {
            const appointment = actionPlanAppointmentFactory.build({
              appointmentFeedback: {
                sessionFeedback: { sessionConcerns: undefined },
              },
            })
            const presenter = new SessionFeedbackInputsPresenter(appointment)

            expect(presenter.fields.sessionConcerns.value).toEqual('')
          })
        })
      })

      describe('when there is user input data', () => {
        it('uses the user input data as the value attribute', () => {
          const appointment = actionPlanAppointmentFactory.build({
            appointmentFeedback: {
              sessionFeedback: {
                sessionSummary: 'Discussed his mental health',
                sessionResponse: 'Engaged well',
                notifyProbationPractitioner: false,
              },
            },
          })
          const presenter = new SessionFeedbackInputsPresenter(appointment, null, {
            'session-summary': 'Discussed accommodation',
          })

          expect(presenter.fields.sessionSummary.value).toEqual('Discussed accommodation')
        })
      })
    })

    describe('notifyProbationPractitioner', () => {
      describe('when there is no user input data', () => {
        describe('when the appointment already has a value selected for notifying the probation practitioner', () => {
          it('uses the pre-selected value', () => {
            const appointment = actionPlanAppointmentFactory.build({
              appointmentFeedback: {
                sessionFeedback: {
                  sessionSummary: 'Summary of the session',
                  sessionResponse: 'Alex was well behaved',
                  notifyProbationPractitioner: false,
                },
              },
            })

            const presenter = new SessionFeedbackInputsPresenter(appointment)

            expect(presenter.fields.notifyProbationPractitioner.value).toEqual(false)
          })
        })

        describe('when the appointment has no value for notifyProbationPractitioner', () => {
          it('sets the value to null', () => {
            const appointment = actionPlanAppointmentFactory.build()

            const presenter = new SessionFeedbackInputsPresenter(appointment)

            expect(presenter.fields.notifyProbationPractitioner.value).toEqual(null)
          })
        })
      })

      describe('when there is user input data', () => {
        it('uses the user input data as the value attribute', () => {
          const appointment = actionPlanAppointmentFactory.build({
            appointmentFeedback: {
              sessionFeedback: {
                sessionSummary: 'Discussed accommodation',
                sessionResponse: 'Engaged well',
                notifyProbationPractitioner: false,
              },
            },
          })
          const presenter = new SessionFeedbackInputsPresenter(appointment, null, {
            'session-summary': 'Discussed accommodation',
            'session-response': 'Engaged well',
            'notify-probation-practitioner': 'yes',
          })

          expect(presenter.fields.sessionSummary.value).toEqual('Discussed accommodation')
          expect(presenter.fields.sessionResponse.value).toEqual('Engaged well')
          expect(presenter.fields.notifyProbationPractitioner.value).toEqual(true)
        })
      })
    })

    describe('errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const presenter = new SessionFeedbackInputsPresenter(appointment, {
          errors: [
            {
              formFields: ['session-summary'],
              errorSummaryLinkedField: 'session-summary',
              message: 'summary error msg',
            },
            {
              formFields: ['session-response'],
              errorSummaryLinkedField: 'session-response',
              message: 'response error msg',
            },
            {
              formFields: ['session-concerns'],
              errorSummaryLinkedField: 'session-concerns',
              message: 'concerns error msg',
            },
            {
              formFields: ['notify-probation-practitioner'],
              errorSummaryLinkedField: 'notify-probation-practitioner',
              message: 'notify pp msg',
            },
          ],
        })

        expect(presenter.fields.sessionSummary.errorMessage).toEqual('summary error msg')
        expect(presenter.fields.sessionResponse.errorMessage).toEqual('response error msg')
        expect(presenter.fields.sessionConcerns.errorMessage).toEqual('concerns error msg')
        expect(presenter.fields.notifyProbationPractitioner.errorMessage).toEqual('notify pp msg')
      })
    })
  })
})
