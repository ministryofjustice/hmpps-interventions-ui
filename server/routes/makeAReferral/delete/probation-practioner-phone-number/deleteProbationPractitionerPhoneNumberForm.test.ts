import TestUtils from '../../../../../testutils/testUtils'
import DeleteProbationPractitionerPhoneNumberForm from './deleteProbationPractitionerPhoneNumberForm'

describe(DeleteProbationPractitionerPhoneNumberForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner email is passed', () => {
      it('returns a paramsForUpdate with an empty ndeliusPPEmailAddress property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-phone-number': '075443435343',
        })
        const data = await new DeleteProbationPractitionerPhoneNumberForm(request)

        expect(data?.paramsForUpdate?.ndeliusPhoneNumber).toEqual('')
      })
    })
  })
})
