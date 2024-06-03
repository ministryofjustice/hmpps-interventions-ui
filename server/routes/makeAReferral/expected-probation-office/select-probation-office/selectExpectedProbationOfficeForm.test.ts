import TestUtils from '../../../../../testutils/testUtils'
import SelectExpectedProbationOfficeForm from './selectExpectedProbationOfficeForm'

describe(SelectExpectedProbationOfficeForm, () => {
  describe('data', () => {
    describe('when a valid expected probation office is passed', () => {
      it('returns a paramsForUpdate with the expected probation office', async () => {
        const request = TestUtils.createRequest({
          'expected-probation-office': 'London',
        })
        const data = await SelectExpectedProbationOfficeForm.createForm(request)

        expect(data.paramsForUpdate?.expectedProbationOffice).toEqual('London')
      })
    })
  })
})
