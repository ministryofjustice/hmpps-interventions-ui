import TestUtils from '../../../../../testutils/testUtils'
import ExpectedReleaseDateUnknownForm from './expectedReleaseDateUnknownForm'

describe(ExpectedReleaseDateUnknownForm, () => {
  describe('when a expected release date is not known', () => {
    it('returns a paramsForUpdate with the reason for why the release date is not known', async () => {
      const request = TestUtils.createRequest({
        'release-date-unknown-reason': 'data not received from nDelius',
      })
      const data = await new ExpectedReleaseDateUnknownForm(request).data()

      expect(data.paramsForUpdate?.expectedReleaseDateMissingReason).toEqual('data not received from nDelius')
    })
  })

  describe('when an reason for not knowing the expected date is not filled', () => {
    it('returns a validation error with the appropriate error message', async () => {
      const request = TestUtils.createRequest({
        'release-date-unknown-reason': '',
      })
      const data = await new ExpectedReleaseDateUnknownForm(request).data()

      expect(data.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'release-date-unknown-reason',
            formFields: ['release-date-unknown-reason'],
            message: 'Enter a reason why the expected release date is not known',
          },
        ],
      })
    })
  })
})
