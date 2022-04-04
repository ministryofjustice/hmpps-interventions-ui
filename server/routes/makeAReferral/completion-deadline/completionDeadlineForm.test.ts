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

        const data = await new CompletionDeadlineForm(request, false).data()

        expect(data.paramsForUpdate).toEqual({ "draftReferral": {completionDeadline: '2021-09-12' }, "reasonForUpdate": null})
      })
    })

    describe('with invalid data', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({
          'completion-deadline-year': '2021',
          'completion-deadline-month': '09',
          'completion-deadline-day': '',
        })

        const data = await new CompletionDeadlineForm(request, false).data()

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
  describe('for a sent referral', () => {
    it('no errors for valid data', async () => {
      const request = TestUtils.createRequest({
        'completion-deadline-year': '2021',
        'completion-deadline-month': '09',
        'completion-deadline-day': '12',
        'reason-for-change': 'reason'
      })

      const data = await new CompletionDeadlineForm(request, true).data()
      expect(data.paramsForUpdate).toEqual({ "draftReferral": {completionDeadline: '2021-09-12' }, "reasonForUpdate": 'reason'})
    })

    it('no errors for valid data', async () => {
      const request = TestUtils.createRequest({
        'completion-deadline-year': '2021',
        'completion-deadline-month': '09',
        'completion-deadline-day': '12',
        'reason-for-change': 'reason'
      })

      const data = await new CompletionDeadlineForm(request, true).data()
      expect(data.paramsForUpdate).toEqual({ "draftReferral": {completionDeadline: '2021-09-12' }, "reasonForUpdate": 'reason'})
    })
    it('returns an error if reason for change is invalid but completion date is valid', async () => {
      const request = TestUtils.createRequest({
        'completion-deadline-year': '2021',
        'completion-deadline-month': '09',
        'completion-deadline-day': '12',
        'reason-for-change': ''
      })

      const data = await new CompletionDeadlineForm(request, true).data()
      expect(data.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'reason-for-change',
            formFields: ['reason-for-change'],
            message: 'Reason for change cannot be empty',
          },
        ],
      })
    })
    it('returns an error if completion date is valid but reason for change is invalid', async () => {
      const request = TestUtils.createRequest({
        'completion-deadline-year': '2021',
        'completion-deadline-month': '09',
        'completion-deadline-day': '',
        'reason-for-change': 'reason'
      })

      const data = await new CompletionDeadlineForm(request, true).data()
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
    it('returns both errors if both completion date and reason for change are invalid', async () => {
      const request = TestUtils.createRequest({
        'completion-deadline-year': '2021',
        'completion-deadline-month': '09',
        'completion-deadline-day': '',
        'reason-for-change': ''
      })

      const data = await new CompletionDeadlineForm(request, true).data()
      expect(data.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'completion-deadline-day',
            formFields: ['completion-deadline-day'],
            message: 'The date by which the service needs to be completed must include a day',
          },
          {
            errorSummaryLinkedField: 'reason-for-change',
            formFields: ['reason-for-change'],
            message: 'Reason for change cannot be empty',
          },
        ],
      })
    })
  })
})
