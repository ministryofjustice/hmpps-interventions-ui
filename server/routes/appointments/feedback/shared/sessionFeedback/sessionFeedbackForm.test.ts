import TestUtils from '../../../../../../testutils/testUtils'
import SessionFeedbackForm from './sessionFeedbackForm'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'

describe(SessionFeedbackForm, () => {
  describe('data', () => {
    const serviceUser = deliusServiceUserFactory.build()
    describe('with valid data', () => {
      it('returns a paramsForUpdate with boolean value for whether to notify the PP', async () => {
        const request = TestUtils.createRequest({
          'session-summary': 'summary',
          'session-response': 'response',
          'notify-probation-practitioner': 'no',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.paramsForUpdate?.notifyProbationPractitioner).toEqual(false)
      })
    })

    describe('invalid fields', () => {
      describe('submitting feedback for supplier assessment appointment', () => {
        it('returns errors when required fields are not present', async () => {
          const request = TestUtils.createRequest({})

          const data = await new SessionFeedbackForm(request, serviceUser, true).data()

          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'notify-probation-practitioner',
            formFields: ['notify-probation-practitioner'],
            message: 'Select whether to notify the probation practitioner or not',
          })
          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'session-summary',
            formFields: ['session-summary'],
            message: 'Enter what you did in the appointment',
          })
          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'session-response',
            formFields: ['session-response'],
            message: 'Enter how Alex River responded to the appointment',
          })
        })
      })

      describe('submitting feedback for action plan appointment', () => {
        it('returns errors when required fields are not present', async () => {
          const request = TestUtils.createRequest({})

          const data = await new SessionFeedbackForm(request, serviceUser, false).data()

          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'notify-probation-practitioner',
            formFields: ['notify-probation-practitioner'],
            message: 'Select whether to notify the probation practitioner or not',
          })
          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'session-summary',
            formFields: ['session-summary'],
            message: 'Enter what you did in the session',
          })
          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'session-response',
            formFields: ['session-response'],
            message: 'Enter how Alex River responded to the session',
          })
        })
      })

      it('returns the error when yes is selected for notify probation practitioner but session concerns is empty', async () => {
        const request = TestUtils.createRequest({
          'session-summary': 'summary',
          'session-response': 'response',
          'session-concerns': '',
          'notify-probation-practitioner': 'yes',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.error?.errors).toEqual([
          {
            errorSummaryLinkedField: 'session-concerns',
            formFields: ['session-concerns'],
            message: 'Enter a description of what concerned you',
          },
        ])
      })

      it('returns the error when notify probation practitioner value is missing', async () => {
        const request = TestUtils.createRequest({
          'session-summary': 'summary',
          'session-response': 'response',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.error?.errors).toEqual([
          {
            errorSummaryLinkedField: 'notify-probation-practitioner',
            formFields: ['notify-probation-practitioner'],
            message: 'Select whether to notify the probation practitioner or not',
          },
        ])
      })
    })
  })
})
