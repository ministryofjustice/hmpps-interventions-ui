import TestUtils from '../../../../testutils/testUtils'
import ReferralCreationReasonForm from './referralCreationReasonForm'

describe(ReferralCreationReasonForm, () => {
  describe('when a expected release date is not known', () => {
    it('returns a paramsForUpdate with the reason for why the release date is not known', async () => {
      const request = TestUtils.createRequest({
        'referral-creation-reason-before-allocation': 'for a quick assessment',
      })
      const data = await new ReferralCreationReasonForm(request).data()

      expect(data.paramsForUpdate?.reasonForReferralCreationBeforeAllocation).toEqual('for a quick assessment')
    })
  })
})
