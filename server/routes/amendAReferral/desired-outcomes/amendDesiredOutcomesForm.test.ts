import TestUtils from '../../../../testutils/testUtils'
import AmendDesiredOutcomesForm from './amendDesiredOutcomesForm'
import errorMessages from '../../../utils/errorMessages'

describe(AmendDesiredOutcomesForm, () => {
  describe('data', () => {
    describe('when a valid reason is passed', () => {
      it('returns a paramsForUpdate with expected properties', async () => {
        const request = TestUtils.createRequest({
          'reason-for-change': 'some reason',
          'desired-outcomes-ids': [1, 2, 3],
        })
        request.params = {
          referralId: 'referral-id',
          serviceCategoryId: 'service-category-id',
        }
        const data = await new AmendDesiredOutcomesForm(request).data()

        expect(data.paramsForUpdate).toMatchObject({ desiredOutcomesIds: [1, 2, 3], reasonForChange: 'some reason' })
        expect(data.error).toBeNull()
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the reason-for-change property is not present or empty', async () => {
      const requestWithMissingReason = TestUtils.createRequest({
        'desired-outcomes-ids': [1, 2, 3],
      })
      requestWithMissingReason.params = {
        referralId: 'referral-id',
        serviceCategoryId: 'service-category-id',
      }
      const missingData = await new AmendDesiredOutcomesForm(requestWithMissingReason).data()

      const requestWithEmptyReason = TestUtils.createRequest({
        'reason-for-change': '   ',
        'desired-outcomes-ids': [1, 2, 3],
      })
      requestWithEmptyReason.params = {
        referralId: 'referral-id',
        serviceCategoryId: 'service-category-id',
      }
      const emptyData = await new AmendDesiredOutcomesForm(requestWithEmptyReason).data()

      expect(missingData).toEqual(emptyData)
      expect(missingData.paramsForUpdate).toBeNull()
      expect(missingData.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendDesiredOutcomesForm.reasonForChangeId,
        formFields: [AmendDesiredOutcomesForm.reasonForChangeId],
        message: errorMessages.amendReferralFields.missingReason,
      })
    })

    it('returns an error when no desired outcomes are selected', async () => {
      const request = TestUtils.createRequest({
        'desired-outcomes-ids': [],
        'reason-for-change': ' test error',
      })
      request.params = {
        referralId: 'referral-id',
        serviceCategoryId: 'service-category-id',
      }
      const data = await new AmendDesiredOutcomesForm(request).data()

      expect(data.paramsForUpdate).toBeNull()
      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendDesiredOutcomesForm.desiredOutcomesId,
        formFields: [AmendDesiredOutcomesForm.desiredOutcomesId],
        message: errorMessages.desiredOutcomes.empty,
      })
    })

    it('returns an error when desired outcomes are not changed', async () => {
      const request = TestUtils.createRequest({
        'desired-outcomes-ids': [1, 2, 3],
        origOutcomes: [1, 2, 3],
        'reason-for-change': ' test error',
      })
      request.params = {
        referralId: 'referral-id',
        serviceCategoryId: 'service-category-id',
      }
      const data = await new AmendDesiredOutcomesForm(request).data()

      expect(data.paramsForUpdate).toBeNull()
      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendDesiredOutcomesForm.desiredOutcomesId,
        formFields: [AmendDesiredOutcomesForm.desiredOutcomesId],
        message: errorMessages.desiredOutcomes.noChanges,
      })
    })
  })
})
