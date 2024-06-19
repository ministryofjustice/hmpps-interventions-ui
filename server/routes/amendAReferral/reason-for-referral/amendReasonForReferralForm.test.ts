import AmendReasonForReferralForm from './amendReasonForReferralForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendReasonForReferralForm, () => {
  describe('data', () => {
    describe('when reason for referral are passed', () => {
      it('returns a paramsForUpdate with the reasonForReferral', async () => {
        const request = TestUtils.createRequest({
          'amend-reason-for-referral': 'To refer him to CRS',
        })
        const data = await new AmendReasonForReferralForm(request).data()

        expect(data.paramsForUpdate?.reasonForReferral).toEqual('To refer him to CRS')
        expect(data.paramsForUpdate?.reasonForChange).toEqual('')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the cancellationReason property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new AmendReasonForReferralForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-reason-for-referral',
        formFields: ['amend-reason-for-referral'],
        message: 'Enter reason for the referral and any further information',
      })
    })
  })
})
