import UpdateProbationPractitionerNamePresenter from './updateProbationPractitionerNamePresenter'

describe(UpdateProbationPractitionerNamePresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new UpdateProbationPractitionerNamePresenter('1', 'crn', 'Alex River', 'David', 'Blake')

      expect(presenter.text.title).toEqual('Update probation practitioner name')
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
      expect(presenter.text.inputHeading).toEqual('Full name')
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerNamePresenter('1', 'crn', 'Alex River', 'David', 'Blake')

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new UpdateProbationPractitionerNamePresenter(
          '1',
          'crn',
          'Alex River',
          'David',
          'Blake',
          false,
          {
            errors: [
              {
                formFields: ['delius-probation-practitioner-name'],
                errorSummaryLinkedField: 'delius-probation-practitioner-name',
                message: 'Input a Valid name',
              },
            ],
          }
        )

        expect(presenter.errorMessage).toEqual('Input a Valid name')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerNamePresenter('1', 'crn', 'Alex River', 'David', 'Blake')

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new UpdateProbationPractitionerNamePresenter(
          '1',
          'crn',
          'Alex River',
          'David',
          'Blake',
          false,
          {
            errors: [
              {
                formFields: ['delius-probation-practitioner-name'],
                errorSummaryLinkedField: 'delius-probation-practitioner-name',
                message: 'Input a Valid name',
              },
            ],
          }
        )

        expect(presenter.errorSummary).toEqual([
          {
            field: 'delius-probation-practitioner-name',
            message: 'Input a Valid name',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('updateProbationPractitionerName', () => {
      describe('when no probation practitioner name have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new UpdateProbationPractitionerNamePresenter('1', 'crn', '', 'David', 'Blake')

          expect(presenter.fields.ndeliusPPName).toEqual('')
        })
      })

      describe('when the referral already has nDelius probation practitioner name is set and there is no user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerNamePresenter('1', 'crn', 'Alex River', 'David', 'Blake')

          expect(presenter.fields.ndeliusPPName).toEqual('Alex River')
        })
      })

      describe('when there is a user input data then the already set ndelius pp name is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerNamePresenter(
            '1',
            'crn',
            'Alex River',
            'David',
            'Blake',
            false,
            null,
            {
              'delius-probation-practitioner-name': 'David Boon',
            }
          )

          expect(presenter.fields.ndeliusPPName).toEqual('David Boon')
        })
      })
    })
  })
})
