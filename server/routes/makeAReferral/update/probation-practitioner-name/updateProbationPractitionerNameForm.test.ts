import TestUtils from '../../../../../testutils/testUtils'
import UpdateProbationPractitionerNameForm from './updateProbationPractitionerNameForm'

describe(UpdateProbationPractitionerNameForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner name is passed', () => {
      it('returns a paramsForUpdate with the nDeliusPPName property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-name': 'David Blake',
        })
        const data = await new UpdateProbationPractitionerNameForm(request).data()

        expect(data.paramsForUpdate?.ppName).toEqual('David Blake')
      })
    })
  })
})
