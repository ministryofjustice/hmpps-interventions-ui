import DeleteProbationPractitionerFieldsPresenter from './deleteProbationPractitionerFieldsPresenter'

describe(DeleteProbationPractitionerFieldsPresenter, () => {
  describe('text', () => {
    it.each([
      ['phone-number', 'probation practitioner phone number'],
      ['probation-office', 'probation office'],
      ['team-phone-number', 'team phone number'],
      ['email-address', 'probation practitioner email address'],
    ])("when the url param has '%s'", (input, expected) => {
      const presenter = new DeleteProbationPractitionerFieldsPresenter('1', 'crn', input, 'David', 'Blake')

      expect(presenter.text.heading).toEqual(expected)
      expect(presenter.text.title).toEqual(`Are you sure you want to delete the ${expected}?`)
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
    })
  })
})
