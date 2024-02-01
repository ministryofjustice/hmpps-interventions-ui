import DeleteProbationPractitionerPhoneNumberPresenter from './deleteProbationPractitionerPhoneNumberPresenter'

describe(DeleteProbationPractitionerPhoneNumberPresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new DeleteProbationPractitionerPhoneNumberPresenter('1', 'crn', '07592323233', 'David', 'Blake')

      expect(presenter.text.title).toEqual('Are you sure you want to delete the probation practitioner phone number?')
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
    })
  })

  describe('fields', () => {
    describe('deleteProbationPractitionerPhoneNumber', () => {
      describe('when probation practitioner phone number have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new DeleteProbationPractitionerPhoneNumberPresenter(
            '1',
            'crn',
            '07534343434',
            'David',
            'Blake'
          )

          expect(presenter.fields.ndeliusPPPhoneNumber).toEqual('07534343434')
        })
      })
      describe('when no probation practitioner phone number have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new DeleteProbationPractitionerPhoneNumberPresenter('1', 'crn', '', 'David', 'Blake')
          expect(presenter.fields.ndeliusPPPhoneNumber).toEqual('')
        })
      })
    })
  })
})
