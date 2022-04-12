import TestUtils from '../../../../testutils/testUtils'
import AmendMaximumEnforceableDaysForm from './amendMaximumEnforceableDaysForm'
import errorMessages from '../../../utils/errorMessages'

describe(AmendMaximumEnforceableDaysForm, () => {
  describe('data', () => {
    describe('when a valid reason is passed', () => {
      it('returns a paramsForUpdate with the reasonForChange property', async () => {
        const request = TestUtils.createRequest({
          'maximum-enforceable-days': '1',
          'reason-for-change': 'some reason',
        })
        const data = await new AmendMaximumEnforceableDaysForm(request).data()

        expect(data.paramsForUpdate?.reasonForChange).toEqual('some reason')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the reason-for-change property is not present or empty', async () => {
      const requestWithMissingReason = TestUtils.createRequest({
        'maximum-enforceable-days': '1',
      })
      const missingData = await new AmendMaximumEnforceableDaysForm(requestWithMissingReason).data()

      const requestWithEmptyReason = TestUtils.createRequest({
        'maximum-enforceable-days': '1',
        'reason-for-change': '   ',
      })
      const emptyData = await new AmendMaximumEnforceableDaysForm(requestWithEmptyReason).data()

      expect(missingData).toEqual(emptyData)
      expect(missingData.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendMaximumEnforceableDaysForm.reasonForChangeId,
        formFields: [AmendMaximumEnforceableDaysForm.reasonForChangeId],
        message: errorMessages.amendReferralFields.missingReason,
      })
    })
  })
})
