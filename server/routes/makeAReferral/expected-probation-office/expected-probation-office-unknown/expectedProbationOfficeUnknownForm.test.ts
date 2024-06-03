import TestUtils from '../../../../../testutils/testUtils'
import ExpectedProbationOfficeUnknownForm from './expectedProbationOfficeUnknownForm'

describe(ExpectedProbationOfficeUnknownForm, () => {
  describe('when a expected probation office is not known', () => {
    it('returns a paramsForUpdate with the reason for why the probation office is not known', async () => {
      const request = TestUtils.createRequest({
        'probation-office-unknown-reason': 'data not received from nDelius',
      })
      const data = await new ExpectedProbationOfficeUnknownForm(request).data()

      expect(data.paramsForUpdate?.expectedProbationOfficeUnKnownReason).toEqual('data not received from nDelius')
    })
  })

  describe('when an reason for not knowing the expected date is not filled', () => {
    it('returns a validation error with the appropriate error message', async () => {
      const request = TestUtils.createRequest({
        'probation-office-unknown-reason': '',
      })
      const data = await new ExpectedProbationOfficeUnknownForm(request).data()

      expect(data.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'probation-office-unknown-reason',
            formFields: ['probation-office-unknown-reason'],
            message: 'Enter a reason why the expected probation office is not known',
          },
        ],
      })
    })
  })
})
