import DeleteProbationPractitionerPhoneNumberForm from './deleteProbationPractitionerPhoneNumberForm'

describe(DeleteProbationPractitionerPhoneNumberForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner phone number is passed', () => {
      it('returns a paramsForUpdate with an empty ndeliusPPPhone Number property', async () => {
        const data = await new DeleteProbationPractitionerPhoneNumberForm()
        expect(data?.paramsForUpdate?.ndeliusPhoneNumber).toEqual('')
      })
    })
  })
})
