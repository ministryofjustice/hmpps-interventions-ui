import TestUtils from '../../../../testutils/testUtils'
import PostSessionBehaviourFeedbackForm from './postSessionBehaviourFeedbackForm'

describe(PostSessionBehaviourFeedbackForm, () => {
  describe('data', () => {
    describe('with valid data', () => {
      it('returns a paramsForUpdate with the behaviour description and boolean value for whether to notify the PP', async () => {
        const request = TestUtils.createRequest({
          'behaviour-description': 'Alex was well-behaved',
          'notify-probation-practitioner': 'no',
        })

        const data = await new PostSessionBehaviourFeedbackForm(request).data()

        expect(data.paramsForUpdate?.behaviourDescription).toEqual('Alex was well-behaved')
        expect(data.paramsForUpdate?.notifyProbationPractitioner).toEqual(false)
      })
    })

    describe('invalid fields', () => {
      it('returns errors when both required fields are not present', async () => {
        const request = TestUtils.createRequest({})

        const data = await new PostSessionBehaviourFeedbackForm(request).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'behaviour-description',
          formFields: ['behaviour-description'],
          message: "Enter a description of the service user's behaviour",
        })
        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'notify-probation-practitioner',
          formFields: ['notify-probation-practitioner'],
          message: 'Select whether to notify the probation practitioner or not',
        })
      })

      it('returns the error when behaviour description is invalid', async () => {
        const request = TestUtils.createRequest({
          'behaviour-description': '',
          'notify-probation-practitioner': 'yes',
        })

        const data = await new PostSessionBehaviourFeedbackForm(request).data()

        expect(data.error?.errors).toEqual([
          {
            errorSummaryLinkedField: 'behaviour-description',
            formFields: ['behaviour-description'],
            message: "Enter a description of the service user's behaviour",
          },
        ])
      })

      it('returns the error when notify probation practitioner value is missing', async () => {
        const request = TestUtils.createRequest({
          'behaviour-description': 'They did well',
        })

        const data = await new PostSessionBehaviourFeedbackForm(request).data()

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
