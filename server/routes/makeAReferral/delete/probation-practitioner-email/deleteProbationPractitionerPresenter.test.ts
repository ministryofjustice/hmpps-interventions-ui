import DeleteProbationPractitionerPresenter from './deleteProbationPractitionerPresenter'

describe(DeleteProbationPractitionerPresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new DeleteProbationPractitionerPresenter('1', 'crn', 'Alex River', 'David', 'Blake')

      expect(presenter.text.title).toEqual('Are you sure you want to delete the probation practitioner email address?')
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
      expect(presenter.text.inputHeading).toEqual('Email Address')
    })
  })

  describe('fields', () => {
    describe('deleteProbationPractitionerEmailAddress', () => {
      describe('when no probation practitioner email address have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new DeleteProbationPractitionerPresenter('1', 'crn', '', 'David', 'Blake')

          expect(presenter.fields.ndeliusPPEmailAddress).toEqual('')
        })
      })

      describe('when the referral already has nDelius probation practitioner email is set and there is no user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new DeleteProbationPractitionerPresenter('1', 'crn', 'Sample@nowhere.com', 'David', 'Blake')

          expect(presenter.fields.ndeliusPPEmailAddress).toEqual('Sample@nowhere.com')
        })
      })

      describe('when there is a user input data then the already set ndelius pp name is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new DeleteProbationPractitionerPresenter(
            '1',
            'crn',
            'sample@nowhere.com',
            'David',
            'Blake',
            {
              'delius-probation-practitioner-email': 'sample@nowhere.com',
            }
          )

          expect(presenter.fields.ndeliusPPEmailAddress).toEqual('sample@nowhere.com')
        })
      })
    })
  })
})
