import AmendProbationPractitionerPhoneNumberForm from './amendProbationPractitionerPhoneNumberForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendProbationPractitionerPhoneNumberForm, () => {
  describe('data', () => {
    describe('when phone number is passed', () => {
      it('returns a paramsForUpdate with the phone number', async () => {
        const request = TestUtils.createRequest({
          'amend-probation-practitioner-phone-number': '111111111',
        })
        const data = await new AmendProbationPractitionerPhoneNumberForm(request, '0123456789').data()

        expect(data.paramsForUpdate?.ppPhoneNumber).toEqual('111111111')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the phone number is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new AmendProbationPractitionerPhoneNumberForm(request, '0123456789').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-phone-number',
        formFields: ['amend-probation-practitioner-phone-number'],
        message: 'Enter probation practitioner phone number',
      })
    })
  })

  describe('invalid phone number', () => {
    it('returns an error when the phone number is not a valid phone number', async () => {
      const request = TestUtils.createRequest({
        'amend-probation-practitioner-phone-number': 'abc',
      })

      const data = await new AmendProbationPractitionerPhoneNumberForm(request, '0123456789').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-phone-number',
        formFields: ['amend-probation-practitioner-phone-number'],
        message: 'Enter phone number in the correct format',
      })
    })
  })

  describe('unchanged phone number', () => {
    it('returns an error when the phone number is unchanged', async () => {
      const request = TestUtils.createRequest({ 'amend-probation-practitioner-phone-number': '1111111111' })

      const data = await new AmendProbationPractitionerPhoneNumberForm(request, '1111111111').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-phone-number',
        formFields: ['amend-probation-practitioner-phone-number'],
        message: 'Probation practitioner phone number must have changed',
      })
    })
  })
})
