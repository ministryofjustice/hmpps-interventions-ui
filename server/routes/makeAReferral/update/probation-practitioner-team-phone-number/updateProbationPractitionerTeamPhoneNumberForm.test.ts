import TestUtils from '../../../../../testutils/testUtils'
import UpdateProbationPractitionerTeamPhoneNumberForm from './updateProbationPractitionerTeamPhoneNumberForm'

describe(UpdateProbationPractitionerTeamPhoneNumberForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner phone number is passed', () => {
      it('returns a paramsForUpdate with the nDeliusPPPhoneNumber property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-team-phone-number': '07594343232',
        })
        const data = await new UpdateProbationPractitionerTeamPhoneNumberForm(request).data()

        expect(data.paramsForUpdate?.ndeliusTeamPhoneNumber).toEqual('07594343232')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the phone number property is an invalid format', async () => {
      const request = TestUtils.createRequest({
        'delius-probation-practitioner-team-phone-number': 'invalidFormat.com',
      })

      const data = await new UpdateProbationPractitionerTeamPhoneNumberForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'delius-probation-practitioner-team-phone-number',
        formFields: ['delius-probation-practitioner-team-phone-number'],
        message: 'Enter numbers only',
      })
    })
  })
})
