import TestUtils from '../../../../testutils/testUtils'
import AmendEmploymentResponsibilitiesForm from './amendEmploymentResponsibilitiesForm'
import errorMessages from '../../../utils/errorMessages'

describe(AmendEmploymentResponsibilitiesForm, () => {
  describe('data', () => {
    describe('when a valid reason is passed', () => {
      it('returns a paramsForUpdate with expected properties', async () => {
        const request = TestUtils.createRequest({
          'reason-for-change': 'some reason',
          'has-additional-responsibilities': 'yes',
          'when-unavailable': 'random time',
          originalEmploymentResponsibilities: {
            hasAdditionalResponsibilities: 'no',
            whenUnavailable: null,
          },
        })
        request.params = {
          referralId: 'referral-id',
        }
        const data = await new AmendEmploymentResponsibilitiesForm(request).data()

        expect(data.paramsForUpdate).toMatchObject({
          hasAdditionalResponsibilities: true,
          reasonForChange: 'some reason',
          whenUnavailable: 'random time',
          changesMade: true,
        })
        expect(data.error).toBeNull()
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the reason-for-change property is not present or empty', async () => {
      const requestWithMissingReason = TestUtils.createRequest({
        'has-additional-responsibilities': 'yes',
        'when-unavailable': 'random time',
        originalEmploymentResponsibilities: {
          hasAdditionalResponsibilities: 'no',
          whenUnavailable: null,
        },
      })
      requestWithMissingReason.params = {
        referralId: 'referral-id',
      }
      const missingData = await new AmendEmploymentResponsibilitiesForm(requestWithMissingReason).data()

      const requestWithEmptyReason = TestUtils.createRequest({
        'reason-for-change': '   ',
        'has-additional-responsibilities': 'yes',
        'when-unavailable': 'random time',
        originalEmploymentResponsibilities: {
          hasAdditionalResponsibilities: 'no',
          whenUnavailable: null,
        },
      })
      requestWithEmptyReason.params = {
        referralId: 'referral-id',
      }
      const emptyData = await new AmendEmploymentResponsibilitiesForm(requestWithEmptyReason).data()

      expect(missingData).toEqual(emptyData)
      expect(missingData.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId,
        formFields: [AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId],
        message: errorMessages.amendReferralFields.missingReason,
      })
    })

    it('returns an error when additional responsibilities is yes but no when available is provided', async () => {
      const request = TestUtils.createRequest({
        'reason-for-change': 'some reason',
        'has-additional-responsibilities': 'yes',
        'when-unavailable': '',
        originalEmploymentResponsibilities: {
          hasAdditionalResponsibilities: 'no',
          whenUnavailable: null,
        },
      })
      request.params = {
        referralId: 'referral-id',
      }
      const data = await new AmendEmploymentResponsibilitiesForm(request).data()

      expect(data.paramsForUpdate).toBeNull()
      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'when-unavailable',
        formFields: ['when-unavailable'],
        message: errorMessages.employmentResponsibilities.whenUnavailable.empty,
      })
    })

    it('returns an error when values have no been changed', async () => {
      const request = TestUtils.createRequest({
        'reason-for-change': 'some reason',
        'has-additional-responsibilities': 'yes',
        'when-unavailable': 'hello',
        originalEmploymentResponsibilities: {
          hasAdditionalResponsibilities: 'yes',
          whenUnavailable: 'hello',
        },
      })
      request.params = {
        referralId: 'referral-id',
      }
      const data = await new AmendEmploymentResponsibilitiesForm(request).data()

      expect(data.paramsForUpdate).toMatchObject({ changesMade: false })
      expect(data.error).toBeNull()
    })
  })
})
