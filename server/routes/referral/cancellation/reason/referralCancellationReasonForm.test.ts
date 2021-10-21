import TestUtils from '../../../../../testutils/testUtils'
import ReferralCancellationReasonForm from './referralCancellationReasonForm'

describe(ReferralCancellationReasonForm, () => {
  describe('data', () => {
    describe('when both cancellation reason and comments are passed', () => {
      it('returns a paramsForUpdate with the cancellationReason and cancellationComments properties', async () => {
        const request = TestUtils.createRequest({
          'cancellation-reason': 'MOV',
          'cancellation-comments': 'Alex has moved to a new area',
        })
        const data = await new ReferralCancellationReasonForm(request).data()

        expect(data.paramsForUpdate?.cancellationReason).toEqual('MOV')
        expect(data.paramsForUpdate?.cancellationComments).toEqual('Alex has moved to a new area')
      })
    })

    describe('when only cancellation reason is passed', () => {
      it('returns a paramsForUpdate with the cancellationReason property', async () => {
        const request = TestUtils.createRequest({
          'cancellation-reason': 'MOV',
        })
        const data = await new ReferralCancellationReasonForm(request).data()

        expect(data.paramsForUpdate?.cancellationReason).toEqual('MOV')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the cancellationReason property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new ReferralCancellationReasonForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'cancellation-reason',
        formFields: ['cancellation-reason'],
        message: 'Select a reason for cancelling the referral',
      })
    })
  })
})
