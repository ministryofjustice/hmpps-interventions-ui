import TestUtils from '../../../../testutils/testUtils'
import AmendAccessibilityNeedsForm from './amendAccessibilityNeedsForm'
import errorMessages from '../../../utils/errorMessages'

describe(AmendAccessibilityNeedsForm, () => {
  describe('data', () => {
    describe('when a valid reason is passed', () => {
      it('returns a paramsForUpdate with the reasonForChange property', async () => {
        const request = TestUtils.createRequest({
          'accessibility-needs': 'wants wheel chair',
          'reason-for-change': 'some reason',
        })
        const data = await new AmendAccessibilityNeedsForm(request).data()

        expect(data.paramsForUpdate?.accessibilityNeeds).toEqual('wants wheel chair')
        expect(data.paramsForUpdate?.reasonForChange).toEqual('some reason')
      })
    })
  })
})

describe('invalid fields', () => {
  it('returns an error when the reason-for-change property is not present or empty', async () => {
    const requestWithMissingReason = TestUtils.createRequest({
      'accessibility-needs': 'wants wheel chair',
    })
    const missingData = await new AmendAccessibilityNeedsForm(requestWithMissingReason).data()

    const requestWithEmptyReason = TestUtils.createRequest({
      'reason-for-change': '   ',
      'accessibility-needs': 'wants wheel chair',
    })

    const emptyData = await new AmendAccessibilityNeedsForm(requestWithEmptyReason).data()

    expect(missingData).toEqual(emptyData)
    expect(missingData.paramsForUpdate).toBeNull()
    expect(missingData.error?.errors).toContainEqual({
      errorSummaryLinkedField: AmendAccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId,
      formFields: [AmendAccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId],
      message: errorMessages.amendReferralFields.missingReason,
    })
  })

  it('returns an error when accessibility needs are not changed', async () => {
    const request = TestUtils.createRequest({
      'accessibility-needs': 'wants wheel chair',
      origOutcomes: 'wants wheel chair',
      'reason-for-change': ' test error',
    })
    const data = await new AmendAccessibilityNeedsForm(request).data()

    expect(data.paramsForUpdate).toMatchObject({ changesMade: false })
    expect(data.error).toBeNull()
  })
})
