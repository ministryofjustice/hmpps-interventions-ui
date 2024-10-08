import AmendProbationPractitionerNameForm from './amendProbationPractitionerNameForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendProbationPractitionerNameForm, () => {
  describe('data', () => {
    describe('when reason for referral are passed', () => {
      it('returns a paramsForUpdate with the reasonForReferral', async () => {
        const request = TestUtils.createRequest({
          'amend-probation-practitioner-name': 'Alex River',
        })
        const data = await new AmendProbationPractitionerNameForm(request, 'Previous PP').data()

        expect(data.paramsForUpdate?.ppName).toEqual('Alex River')
      })
    })

    describe('when reason for referral are passed, but pp name unchanged', () => {
      it('returns an undefined paramsForUpdate', async () => {
        const request = TestUtils.createRequest({
          'amend-probation-practitioner-name': 'Previous PP',
        })
        const data = await new AmendProbationPractitionerNameForm(request, 'Previous PP').data()

        expect(data.paramsForUpdate?.ppName).toEqual(undefined)

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'amend-probation-practitioner-name',
          formFields: ['amend-probation-practitioner-name'],
          message: 'Probation practitioner name must have changed',
        })
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the cancellationReason property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new AmendProbationPractitionerNameForm(request, 'Previous PP').data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-probation-practitioner-name',
        formFields: ['amend-probation-practitioner-name'],
        message: 'Enter probation practitioner name',
      })
    })
  })
})
