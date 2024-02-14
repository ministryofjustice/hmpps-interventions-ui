import TestUtils from '../../../../../../testutils/testUtils'
import SessionFeedbackForm from './sessionFeedbackForm'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'

describe(SessionFeedbackForm, () => {
  describe('data', () => {
    const serviceUser = deliusServiceUserFactory.build()
    describe('when submitting feedback with notify the probation practitioner checkbox options', () => {
      it('returns a paramsForUpdate with notifyProbationPractitionerOfBehaviour and notifyProbationPractitionerOfConcerns set to false when no is selected', async () => {
        const request = TestUtils.createRequest({
          late: 'no',
          'session-summary': 'summary',
          'session-response': 'response',
          'notify-probation-practitioner': 'no',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.paramsForUpdate?.notifyProbationPractitionerOfBehaviour).toEqual(false)
        expect(data.paramsForUpdate?.notifyProbationPractitionerOfConcerns).toEqual(false)
      })

      it('returns a paramsForUpdate with notifyProbationPractitionerOfBehaviour set to true with sessionBehaviour value when poor behaviour is selected and session behaviour field is not empty', async () => {
        const request = TestUtils.createRequest({
          late: 'no',
          'session-summary': 'summary',
          'session-response': 'response',
          'notify-probation-practitioner-of-behaviour': 'yes',
          'session-behaviour': 'stub session behaviour information',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.paramsForUpdate?.notifyProbationPractitionerOfBehaviour).toEqual(true)
        expect(data.paramsForUpdate?.sessionBehaviour).toEqual('stub session behaviour information')
      })

      it('returns an error when poor behaviour is selected and session behaviour field is empty', async () => {
        const request = TestUtils.createRequest({
          late: 'no',
          'session-summary': 'summary',
          'session-response': 'response',
          'notify-probation-practitioner-of-behaviour': 'yes',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'session-behaviour',
          formFields: ['session-behaviour'],
          message: "Enter details about Alex River's poor behaviour",
        })
      })

      it('returns a paramsForUpdate with notifyProbationPractitionerOfConcerns set to true with sessionConcerns value when concerns is selected and session concerns field is not empty', async () => {
        const request = TestUtils.createRequest({
          late: 'no',
          'session-summary': 'summary',
          'session-response': 'response',
          'notify-probation-practitioner-of-concerns': 'yes',
          'session-concerns': 'stub session concerns information',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.paramsForUpdate?.notifyProbationPractitionerOfConcerns).toEqual(true)
        expect(data.paramsForUpdate?.sessionConcerns).toEqual('stub session concerns information')
      })

      it('returns an error when poor concerns is selected and session concerns field is empty', async () => {
        const request = TestUtils.createRequest({
          late: 'no',
          'session-summary': 'summary',
          'session-response': 'response',
          'notify-probation-practitioner-of-concerns': 'yes',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'session-concerns',
          formFields: ['session-concerns'],
          message: 'Enter a description of what concerned you',
        })
      })

      it('returns a paramsForUpdate with both session behaviour and concerns values when both checkboxes selected', async () => {
        const request = TestUtils.createRequest({
          late: 'no',
          'session-summary': 'summary',
          'session-response': 'response',
          'notify-probation-practitioner-of-behaviour': 'yes',
          'notify-probation-practitioner-of-concerns': 'yes',
          'session-behaviour': 'stub session behaviour information',
          'session-concerns': 'stub session concerns information',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.paramsForUpdate?.notifyProbationPractitionerOfBehaviour).toEqual(true)
        expect(data.paramsForUpdate?.notifyProbationPractitionerOfConcerns).toEqual(true)
        expect(data.paramsForUpdate?.sessionBehaviour).toEqual('stub session behaviour information')
        expect(data.paramsForUpdate?.sessionConcerns).toEqual('stub session concerns information')
      })

      it('returns an error when no checkboxes are selected', async () => {
        const request = TestUtils.createRequest({
          late: 'no',
          'session-summary': 'summary',
          'session-response': 'response',
        })

        const data = await new SessionFeedbackForm(request, serviceUser, false).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'notify-probation-practitioner',
          formFields: ['notify-probation-practitioner'],
          message: "Select 'no' if the probation practitioner does not need to be notified",
        })
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
            message: "Select 'no' if the probation practitioner does not need to be notified",
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
            message: "Select 'no' if the probation practitioner does not need to be notified",
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
    })
  })
})
