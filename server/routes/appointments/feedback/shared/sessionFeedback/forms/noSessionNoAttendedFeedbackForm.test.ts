import TestUtils from '../../../../../../../testutils/testUtils'
import NoSessionNoAttendedFeedbackForm from './noSessionNoAttendedFeedbackForm'

describe(NoSessionNoAttendedFeedbackForm, () => {
  describe('data', () => {
    describe('with valid data', () => {
      it('returns a paramsForUpdate', async () => {
        const request = TestUtils.createRequest({
          'no-attendance-information': 'they did not attend',
          'notify-probation-practitioner': 'no',
        })

        const data = await new NoSessionNoAttendedFeedbackForm(request).data()

        expect(data.paramsForUpdate?.noAttendanceInformation).toEqual('they did not attend')
        expect(data.paramsForUpdate?.notifyProbationPractitioner).toEqual(false)
      })
    })

    describe('invalid fields', () => {
      it('returns errors when required fields are not present', async () => {
        const request = TestUtils.createRequest({})

        const data = await new NoSessionNoAttendedFeedbackForm(request).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'notify-probation-practitioner',
          formFields: ['notify-probation-practitioner'],
          message: 'Select whether to notify the probation practitioner or not',
        })
        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'no-attendance-information',
          formFields: ['no-attendance-information'],
          message: 'Add anything you know about them not attending',
        })
      })

      it('returns the error when yes is selected for notify probation practitioner but session concerns is empty', async () => {
        const request = TestUtils.createRequest({
          'no-attendance-information': 'they did not attend',
          'session-concerns': '',
          'notify-probation-practitioner': 'yes',
        })

        const data = await new NoSessionNoAttendedFeedbackForm(request).data()

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
          'no-attendance-information': 'they did not attend',
          'session-summary': 'summary',
        })

        const data = await new NoSessionNoAttendedFeedbackForm(request).data()

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
