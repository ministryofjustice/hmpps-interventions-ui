import TestUtils from '../../../../testutils/testUtils'
import AmendProbationPractitionerTeamPhoneNumberForm from './amendProbationPractitionerTeamPhoneNumberForm'

describe(AmendProbationPractitionerTeamPhoneNumberForm, () => {
  describe('data', () => {
    describe('when team phone number is passed', () => {
      it('returns a paramsForUpdate with the team phone number', async () => {
        const request = TestUtils.createRequest({
          'amend-probation-practitioner-team-phone-number': '111111111',
        })
        const data = await new AmendProbationPractitionerTeamPhoneNumberForm(request, '0123456789').data()

        expect(data.paramsForUpdate?.ppTeamPhoneNumber).toEqual('111111111')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the team phone number is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new AmendProbationPractitionerTeamPhoneNumberForm(request, '0123456789').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-team-phone-number',
        formFields: ['amend-probation-practitioner-team-phone-number'],
        message: 'Enter team phone number',
      })
    })
  })

  describe('invalid phone number', () => {
    it('returns an error when the team phone number is not a valid phone number', async () => {
      const request = TestUtils.createRequest({
        'amend-probation-practitioner-team-phone-number': 'abc',
      })

      const data = await new AmendProbationPractitionerTeamPhoneNumberForm(request, '0123456789').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-team-phone-number',
        formFields: ['amend-probation-practitioner-team-phone-number'],
        message: 'Enter a valid phone number',
      })
    })
  })

  describe('unchanged phone number', () => {
    it('returns an error when the team phone number is unchanged', async () => {
      const request = TestUtils.createRequest({ 'amend-probation-practitioner-team-phone-number': '1111111111' })

      const data = await new AmendProbationPractitionerTeamPhoneNumberForm(request, '1111111111').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-team-phone-number',
        formFields: ['amend-probation-practitioner-team-phone-number'],
        message: 'Team phone number must have changed',
      })
    })
  })
})
