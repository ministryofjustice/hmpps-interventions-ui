import UpdateProbationPractitionerEmailAddressPresenter from './updateProbationPractitionerEmailAddressPresenter'

describe(UpdateProbationPractitionerEmailAddressPresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
        '1',
        'crn',
        'a.z@xyz.com',
        'David',
        'Blake'
      )

      expect(presenter.text.title).toEqual('Update probation practitioner email address')
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
      expect(presenter.text.inputHeading).toEqual('Email address (if known)')
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
          '1',
          'crn',
          'a.z@xyz.com',
          'David',
          'Blake'
        )

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
          '1',
          'crn',
          'a.z@xyz.com',
          'David',
          'Blake',
          false,
          {
            errors: [
              {
                formFields: ['delius-probation-practitioner-email-address'],
                errorSummaryLinkedField: 'delius-probation-practitioner-email-address',
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
        const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
          '1',
          'crn',
          'a.z@xyz.com',
          'David',
          'Blake'
        )

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
          '1',
          'crn',
          'a.zxyz.com',
          'David',
          'Blake',
          false,
          {
            errors: [
              {
                formFields: ['delius-probation-practitioner-email-address'],
                errorSummaryLinkedField: 'delius-probation-practitioner-email-address',
                message: 'Input a Valid email address',
              },
            ],
          }
        )

        expect(presenter.errorSummary).toEqual([
          {
            field: 'delius-probation-practitioner-email-address',
            message: 'Input a Valid email address',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('updateProbationPractitionerEmailAddress', () => {
      describe('when no probation practitioner email address have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new UpdateProbationPractitionerEmailAddressPresenter('1', 'crn', '', 'David', 'Blake')

          expect(presenter.fields.ppEmailAddress).toEqual('')
        })
      })

      describe('when the referral already has nDelius probation practitioner email address is set and there is no user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
            '1',
            'crn',
            'a.z@xyz.com',
            'David',
            'Blake'
          )

          expect(presenter.fields.ppEmailAddress).toEqual('a.z@xyz.com')
        })
      })

      describe('when there is a user input data then the already set ndelius pp email address is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
            '1',
            'crn',
            'a.z@xyz.com',
            'David',
            'Blake',
            false,
            null,
            {
              'delius-probation-practitioner-email-address': 'a.z@abc.com',
            }
          )

          expect(presenter.fields.ppEmailAddress).toEqual('a.z@abc.com')
        })
      })
    })
  })
})
