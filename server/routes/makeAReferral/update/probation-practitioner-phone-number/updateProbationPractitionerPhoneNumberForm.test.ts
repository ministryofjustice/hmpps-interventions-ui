import TestUtils from '../../../../../testutils/testUtils'
import UpdateProbationPractitionerPhoneNumberForm from './updateProbationPractitionerPhoneNumberForm'

describe(UpdateProbationPractitionerPhoneNumberForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner phone number is passed', () => {
      it('returns a paramsForUpdate with the nDeliusPPPhoneNumber property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-phone-number': '07594343232',
        })
        const data = await new UpdateProbationPractitionerPhoneNumberForm(request).data()

        expect(data.paramsForUpdate?.ndeliusPhoneNumber).toEqual('07594343232')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the phone number property is an invalid format', async () => {
      const request = TestUtils.createRequest({
        'delius-probation-practitioner-phone-number': 'invalidFormat.com',
      })

      const data = await new UpdateProbationPractitionerPhoneNumberForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'delius-probation-practitioner-phone-number',
        formFields: ['delius-probation-practitioner-phone-number'],
        message: 'Enter numbers only',
      })
    })
  })
})
