import ReasonForReferralForm from './reasonForReferralForm'
import TestUtils from '../../../../testutils/testUtils'

describe(ReasonForReferralForm, () => {
  describe('data', () => {
    describe('when reason for referral are passed', () => {
      it('returns a paramsForUpdate with the reasonForReferral', async () => {
        const request = TestUtils.createRequest({
          'reason-for-referral': 'To refer him to CRS',
        })
        const data = await new ReasonForReferralForm(request).data()

        expect(data.paramsForUpdate?.reasonForReferral).toEqual('To refer him to CRS')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the cancellationReason property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new ReasonForReferralForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'reason-for-referral',
        formFields: ['reason-for-referral'],
        message: 'Enter reason for the referral and any further information',
      })
    })
  })
})
