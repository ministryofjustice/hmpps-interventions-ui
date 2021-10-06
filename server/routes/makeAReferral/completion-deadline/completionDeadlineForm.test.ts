import CompletionDeadlineForm from './completionDeadlineForm'
import TestUtils from '../../../../testutils/testUtils'

describe('CompletionDeadlineForm', () => {
  describe('data', () => {
    describe('with valid data', () => {
      it('returns a paramsForUpdate with the completionDeadline key and an ISO-formatted date', async () => {
        const request = TestUtils.createRequest({
          'completion-deadline-year': '2021',
          'completion-deadline-month': '09',
          'completion-deadline-day': '12',
        })

        const data = await new CompletionDeadlineForm(request).data()

        expect(data.paramsForUpdate).toEqual({ completionDeadline: '2021-09-12' })
      })
    })

    describe('with invalid data', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({
          'completion-deadline-year': '2021',
          'completion-deadline-month': '09',
          'completion-deadline-day': '',
        })

        const data = await new CompletionDeadlineForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'completion-deadline-day',
              formFields: ['completion-deadline-day'],
              message: 'The date by which the service needs to be completed must include a day',
            },
          ],
        })
      })
    })
  })
})
