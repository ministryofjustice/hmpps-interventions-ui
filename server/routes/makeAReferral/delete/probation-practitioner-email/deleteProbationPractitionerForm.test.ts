/* import TestUtils from '../../../../../testutils/testUtils'
import UpdateProbationPractitionerForm from './updateProbationPractitionerForm'

describe(UpdateProbationPractitionerForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner name is passed', () => {
      it('returns a paramsForUpdate with the nDeliusPPName property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-name': 'David Blake',
        })
        const data = await new UpdateProbationPractitionerForm(request).data()

        expect(data.paramsForUpdate?.ndeliusPPName).toEqual('David Blake')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the maximum-enforceable-days property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new UpdateProbationPractitionerForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'delius-probation-practitioner-name',
        formFields: ['delius-probation-practitioner-name'],
        message: 'Enter name of probation practitioner',
      })
    })
  })
})
*/
