import DeleteProbationPractitionerFieldsForm from './deleteProbationPractitionerFieldsForm'

describe(DeleteProbationPractitionerFieldsForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner details is passed', () => {
      it.each([
        ['phone-number', { ndeliusPhoneNumber: '' }],
        ['probation-office', { ppProbationOffice: '' }],
        ['team-phone-number', { ndeliusTeamPhoneNumber: '' }],
      ])("when the url param has '%s'", (input, expected) => {
        const data = new DeleteProbationPractitionerFieldsForm(input)
        expect(data?.paramsForUpdate).toEqual(expected)
      })
    })
  })
})
