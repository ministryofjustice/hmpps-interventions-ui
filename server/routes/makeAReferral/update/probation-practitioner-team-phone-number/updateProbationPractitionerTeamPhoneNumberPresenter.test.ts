import UpdateProbationPractitionerTeamPhoneNumberPresenter from './updateProbationPractitionerTeamPhoneNumberPresenter'

describe(UpdateProbationPractitionerTeamPhoneNumberPresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
        '1',
        'crn',
        '074343434334',
        'David',
        'Blake'
      )

      expect(presenter.text.title).toEqual('Update probation practitioner team phone number')
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
      expect(presenter.text.inputHeading).toEqual('Team phone number(if known)')
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
          '1',
          'crn',
          '074343434334',
          'David',
          'Blake'
        )

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
          '1',
          'crn',
          'azss',
          'David',
          'Blake',
          false,
          {
            errors: [
              {
                formFields: ['delius-probation-practitioner-team-phone-number'],
                errorSummaryLinkedField: 'delius-probation-practitioner-team-phone-number',
                message: 'Enter numbers only',
              },
            ],
          }
        )

        expect(presenter.errorMessage).toEqual('Enter numbers only')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
          '1',
          'crn',
          '074343434334',
          'David',
          'Blake'
        )

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
          '1',
          'crn',
          '074343434334',
          'David',
          'Blake',
          false,
          {
            errors: [
              {
                formFields: ['delius-probation-practitioner-team-phone-number'],
                errorSummaryLinkedField: 'delius-probation-practitioner-team-phone-number',
                message: 'Enter numbers only',
              },
            ],
          }
        )

        expect(presenter.errorSummary).toEqual([
          {
            field: 'delius-probation-practitioner-team-phone-number',
            message: 'Enter numbers only',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('updateProbationPractitionerTeamPhoneNumber', () => {
      describe('when no probation practitioner phone number have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter('1', 'crn', '', 'David', 'Blake')
          expect(presenter.fields.ndeliusTeamPhoneNumber).toEqual('')
        })
      })

      describe('when the referral already has nDelius probation practitioner team phone number is set and there is no user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
            '1',
            'crn',
            '0753434233',
            'David',
            'Blake'
          )

          expect(presenter.fields.ndeliusTeamPhoneNumber).toEqual('0753434233')
        })
      })

      describe('when there is a user input data then the already set ndelius team phone number is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
            '1',
            'crn',
            '0734334433',
            'David',
            'Blake',
            false,
            null,
            {
              'delius-probation-practitioner-team-phone-number': '0753423223',
            }
          )

          expect(presenter.fields.ndeliusTeamPhoneNumber).toEqual('0753423223')
        })
      })
    })
  })
})
