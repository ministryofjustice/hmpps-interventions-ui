import AmendProbationPractitionerEmailForm from './amendProbationPractitionerEmailForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendProbationPractitionerEmailForm, () => {
  describe('data', () => {
    describe('when reason for referral are passed', () => {
      it('returns a paramsForUpdate with the reasonForReferral', async () => {
        const request = TestUtils.createRequest({
          'amend-probation-practitioner-email': 'alex.river@somewhere.com',
        })
        const data = await new AmendProbationPractitionerEmailForm(request).data()

        expect(data.paramsForUpdate?.ppEmail).toEqual('alex.river@somewhere.com')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the cancellationReason property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new AmendProbationPractitionerEmailForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-email',
        formFields: ['amend-probation-practitioner-email'],
        message: 'Enter probation practitioner email address',
      })
    })
  })
})
