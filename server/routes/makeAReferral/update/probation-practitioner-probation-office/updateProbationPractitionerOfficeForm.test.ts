import TestUtils from '../../../../../testutils/testUtils'
import UpdateProbationPractitionerOfficeForm from './updateProbationPractitionerOfficeForm'

describe(UpdateProbationPractitionerOfficeForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner probation office is passed', () => {
      it('returns a paramsForUpdate with the probation office property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-office': 'London',
        })
        const data = await new UpdateProbationPractitionerOfficeForm(request).data()

        expect(data.paramsForUpdate?.ppProbationOffice).toEqual('London')
      })
    })
  })
})
