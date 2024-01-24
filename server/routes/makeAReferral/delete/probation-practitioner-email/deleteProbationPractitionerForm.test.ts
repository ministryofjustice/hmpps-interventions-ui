import TestUtils from '../../../../../testutils/testUtils'
import DeleteProbationPractitionerForm from './deleteProbationPractitionerForm'

describe(DeleteProbationPractitionerForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner email is passed', () => {
      it('returns a paramsForUpdate with an empty ndeliusPPEmailAddress property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-email': 'sample@email.com',
        })
        const data = await new DeleteProbationPractitionerForm(request)

        expect(data?.paramsForUpdate?.ndeliusPPEmailAddress).toEqual('')
      })
    })
  })
})
