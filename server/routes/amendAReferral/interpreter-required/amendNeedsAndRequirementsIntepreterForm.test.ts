import TestUtils from '../../../../testutils/testUtils'
import AmendNeedsAndRequirementsIntepreterForm from './amendNeedsAndRequirementsIntepreterForm'
import errorMessages from '../../../utils/errorMessages'

describe(AmendNeedsAndRequirementsIntepreterForm, () => {
  describe('data', () => {
    describe('when a valid reason is passed', () => {
      it('returns a paramsForUpdate with expected properties', async () => {
        const request = TestUtils.createRequest({
          'reason-for-change': 'some reason',
          'interpreter-language': 'Spanish',
          'needs-interpreter': 'yes',
        })
        request.params = {
          referralId: 'referral-id',
        }
        const data = await new AmendNeedsAndRequirementsIntepreterForm(request).data()

        expect(data.paramsForUpdate).toMatchObject({ interpreterLanguage: 'Spanish', reasonForChange: 'some reason',needsInterpreter:true, changesMade:true })
        expect(data.error).toBeNull()
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the reason-for-change property is not present or empty', async () => {
     const requestWithMissingReason = TestUtils.createRequest({
          'interpreter-language': 'Spanish',
          'needsInterpreter': 'true',
        })
      requestWithMissingReason.params = {
        referralId: 'referral-id',
      }
      const missingData = await new AmendNeedsAndRequirementsIntepreterForm(requestWithMissingReason).data()

      const requestWithEmptyReason = TestUtils.createRequest({
        'reason-for-change': '   ',
        'interpreter-language': 'Spanish',
        'needsInterpreter': 'true',
      })
      requestWithEmptyReason.params = {
        referralId: 'referral-id',
        
      }
      const emptyData = await new AmendNeedsAndRequirementsIntepreterForm(requestWithEmptyReason).data()

      expect(missingData).toEqual(emptyData)
      expect(missingData.paramsForUpdate).toBeNull()
      expect(missingData.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId,
        formFields: [AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId],
        message: errorMessages.amendReferralFields.missingReason,
      })
    })

    it('returns an error when interpreter required but no language provided', async () => {
      const request = TestUtils.createRequest({
        'reason-for-change': 'some reason',
        'interpreter-language': '',
        'needs-interpreter': 'yes',
      })
      request.params = {
        referralId: 'referral-id',
      }
      const data = await new AmendNeedsAndRequirementsIntepreterForm(request).data()

      expect(data.paramsForUpdate).toBeNull()
      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendNeedsAndRequirementsIntepreterForm.interpreterLanguageId,
        formFields: [AmendNeedsAndRequirementsIntepreterForm.interpreterLanguageId],
        message: errorMessages.interpreterLanguageWithoutName.empty,
      })
    })

    it('returns an error when interprete language is not changed', async () => {
      const request = TestUtils.createRequest({
        'interpreter-language': 'Spanish',
        'needs-interpreter': 'yes',
        'reason-for-change': 'some reason',
        originalInterpreterNeeds: {
        'intepreterLanguage': 'Spanish',
        'intepreterNeeded': 'yes',}
      })
      request.params = {
        referralId: 'referral-id',
      }
      const data = await new AmendNeedsAndRequirementsIntepreterForm(request).data()

      expect(data.paramsForUpdate).toMatchObject({ changesMade: false })
      expect(data.error).toBeNull()
    })

    it('doesnt return an error when no interpreter required and no language provided', async () => {
      const request = TestUtils.createRequest({
        'interpreter-language': '',
        'reason-for-change': 'some reason',
        'needs-interpreter': 'no',

        originalInterpreterNeeds: {
        'intepreterLanguage': '',
        'needs-interpreter': 'yes',}
      })
      request.params = {
        referralId: 'referral-id',
      }
      const data = await new AmendNeedsAndRequirementsIntepreterForm(request).data()

      expect(data.paramsForUpdate).toMatchObject({ changesMade: true })
      expect(data.error).toBeNull()
    })
  })
})
