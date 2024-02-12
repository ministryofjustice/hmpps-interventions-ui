import DeleteProbationPractitionerFieldsForm from './deleteProbationPractitionerFieldsForm'

describe(DeleteProbationPractitionerFieldsForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner phone number is passed', () => {
      it.each([
        ['phone-number', { ndeliusPhoneNumber: '' }],
        ['probation-office', { ppProbationOffice: '' }],
      ])("when the url param has '%s'", (input, expected) => {
        const data = new DeleteProbationPractitionerFieldsForm(input)
        expect(data?.paramsForUpdate).toEqual(expected)
      })
    })
  })
})
