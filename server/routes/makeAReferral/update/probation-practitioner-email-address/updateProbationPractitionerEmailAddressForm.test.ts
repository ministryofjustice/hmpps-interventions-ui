import TestUtils from '../../../../../testutils/testUtils'
import UpdateProbationPractitionerEmailAddressForm from './updateProbationPractitionerEmailAddressForm'

describe(UpdateProbationPractitionerEmailAddressForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner email address is passed', () => {
      it('returns a paramsForUpdate with the nDeliusPPEmailAddress property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-email-address': 'a.z@xyz.com',
        })
        const data = await new UpdateProbationPractitionerEmailAddressForm(request).data()

        expect(data.paramsForUpdate?.ndeliusPPEmailAddress).toEqual('a.z@xyz.com')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the email address property is empty', async () => {
      const request = TestUtils.createRequest({
        'delius-probation-practitioner-email-address': '',
      })

      const data = await new UpdateProbationPractitionerEmailAddressForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'delius-probation-practitioner-email-address',
        formFields: ['delius-probation-practitioner-email-address'],
        message: 'Enter email address',
      })
    })

    it('returns an error when the email address property is an invalid format', async () => {
      const request = TestUtils.createRequest({
        'delius-probation-practitioner-email-address': 'invalidFormat.com',
      })

      const data = await new UpdateProbationPractitionerEmailAddressForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'delius-probation-practitioner-email-address',
        formFields: ['delius-probation-practitioner-email-address'],
        message: 'Enter an email address in the correct format',
      })
    })
  })
})
