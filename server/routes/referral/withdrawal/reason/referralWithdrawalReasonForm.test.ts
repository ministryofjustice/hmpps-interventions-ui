import TestUtils from '../../../../../testutils/testUtils'
import ReferralWithdrawalReasonForm from './referralWithdrawalReasonForm'
import { WithdrawalState } from '../../../../models/sentReferral'

describe(ReferralWithdrawalReasonForm, () => {
  describe('data', () => {
    describe('when both withdrawal reason and comments are passed', () => {
      it('returns a paramsForUpdate with the withdrawalReason and withdrawalComments properties', async () => {
        const request = TestUtils.createRequest({
          'withdrawal-reason': 'INE',
          'withdrawal-comments-INE': 'Alex has moved to a new area',
        })
        const data = await new ReferralWithdrawalReasonForm(request, WithdrawalState.preICA).data()

        expect(data.paramsForUpdate?.withdrawalReason).toEqual('INE')
        expect(data.paramsForUpdate?.withdrawalComments).toEqual('Alex has moved to a new area')
      })
    })
    describe('when both withdrawal reason and  multiple comment fields are passed', () => {
      it('returns a paramsForUpdate with the withdrawalReason and the matching withdrawalComments properties', async () => {
        const request = TestUtils.createRequest({
          'withdrawal-reason': 'INE',
          'withdrawal-comments-INE': 'Alex has moved to a new area',
          'withdrawal-comments-MIS': 'incorrect comment',
        })
        const data = await new ReferralWithdrawalReasonForm(request, WithdrawalState.preICA).data()

        expect(data.paramsForUpdate?.withdrawalReason).toEqual('INE')
        expect(data.paramsForUpdate?.withdrawalComments).toEqual('Alex has moved to a new area')
      })
    })

    describe('withdrawal state is calculated correctly', () => {
      it('pre-ica', async () => {
        const request = TestUtils.createRequest({
          'withdrawal-reason': 'INE',
          'withdrawal-comments-INE': 'Alex has moved to a new area',
        })
        const data = await new ReferralWithdrawalReasonForm(request, WithdrawalState.preICA).data()

        expect(data.paramsForUpdate?.withdrawalState).toEqual(WithdrawalState.preICA)
      })
      it('post-ica', async () => {
        const request = TestUtils.createRequest({
          'withdrawal-reason': 'INE',
          'withdrawal-comments-INE': 'Alex has moved to a new area',
        })
        const data = await new ReferralWithdrawalReasonForm(request, WithdrawalState.postICA).data()

        expect(data.paramsForUpdate?.withdrawalState).toEqual(WithdrawalState.postICA)
      })
      it('post-ica-closed', async () => {
        const request = TestUtils.createRequest({
          'withdrawal-reason': 'EAR',
          'withdrawal-comments-EAR': 'referral completed',
        })
        const data = await new ReferralWithdrawalReasonForm(request, WithdrawalState.postICA).data()

        expect(data.paramsForUpdate?.withdrawalState).toEqual(WithdrawalState.postICAClosed)
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the withdrawalComments property is not present', async () => {
      const request = TestUtils.createRequest({
        'withdrawal-reason': 'INE',
      })

      const data = await new ReferralWithdrawalReasonForm(request, WithdrawalState.preICA).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'withdrawal-comments-INE',
        formFields: ['withdrawal-comments-INE'],
        message: 'Enter details about why this reason was selected',
      })
    })
    it('returns an error when the withdrawal reason property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new ReferralWithdrawalReasonForm(request, WithdrawalState.preICA).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'withdrawal-reason',
        formFields: ['withdrawal-reason'],
        message: 'Select a reason for withdrawing the referral',
      })
    })
  })
})
