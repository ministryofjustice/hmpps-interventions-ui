import AmendProbationPractitionerEmailForm from './amendProbationPractitionerEmailForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendProbationPractitionerEmailForm, () => {
  describe('data', () => {
    describe('when email address is passed', () => {
      it('returns a paramsForUpdate with the email', async () => {
        const request = TestUtils.createRequest({
          'amend-probation-practitioner-email': 'alex.river@somewhere.com',
        })
        const data = await new AmendProbationPractitionerEmailForm(request, 'alex.river@somewhereelse.com').data()

        expect(data.paramsForUpdate?.ppEmail).toEqual('alex.river@somewhere.com')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the email is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new AmendProbationPractitionerEmailForm(request, 'alex.river@somewhere.com').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-email',
        formFields: ['amend-probation-practitioner-email'],
        message: 'Enter probation practitioner email address',
      })
    })
  })

  describe('invalid email', () => {
    it('returns an error when the email is not a valid email', async () => {
      const request = TestUtils.createRequest({ 'amend-probation-practitioner-email': 'alex.river#somewhere.com' })

      const data = await new AmendProbationPractitionerEmailForm(request, 'alex.river@somewhere.com').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-email',
        formFields: ['amend-probation-practitioner-email'],
        message: 'Enter email address in the correct format',
      })
    })
  })

  describe('unchanged email', () => {
    it('returns an error when the email is unchanged', async () => {
      const request = TestUtils.createRequest({ 'amend-probation-practitioner-email': 'alex.river@somewhere.com' })

      const data = await new AmendProbationPractitionerEmailForm(request, 'alex.river@somewhere.com').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-email',
        formFields: ['amend-probation-practitioner-email'],
        message: 'Probation practitioner email address must have changed',
      })
    })
  })
})
