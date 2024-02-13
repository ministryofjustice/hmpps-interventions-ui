import UpdateProbationPractitionerOfficePresenter from './updateProbationPractitionerOfficePresenter'

describe(UpdateProbationPractitionerOfficePresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new UpdateProbationPractitionerOfficePresenter(
        '1',
        'crn',
        'Norfolk',
        'David',
        'Blake',
        false,
        null,
        null,
        [
          {
            probationOfficeId: 1,
            name: 'London',
            address: '1A cross street',
            probationRegionId: '3',
            govUkURL: 'url',
            deliusCRSLocationId: '1',
          },
        ]
      )

      expect(presenter.text.title).toEqual('Update probation office')
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
      expect(presenter.text.inputHeading).toEqual('Probation office (if known)')
      expect(presenter.text.hint).toEqual('Start typing then choose probation office from the list')
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerOfficePresenter(
          '1',
          'crn',
          'Alex River',
          'David',
          'Blake',
          false,
          null,
          null,
          []
        )

        expect(presenter.errorMessage).toBeNull()
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerOfficePresenter(
          '1',
          'crn',
          'Alex River',
          'David',
          'Blake',
          false,
          null,
          null,
          []
        )

        expect(presenter.errorSummary).toBeNull()
      })
    })
  })

  describe('fields', () => {
    describe('updateProbationPractitionerOffice', () => {
      describe('when no probation practitioner office have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new UpdateProbationPractitionerOfficePresenter(
            '1',
            'crn',
            '',
            'David',
            'Blake',
            false,
            null,
            null,
            []
          )

          expect(presenter.fields.ppProbationOffice).toEqual('')
        })
      })

      describe('when the probation office is set', () => {
        it('when the referral already has set pp probation office and there is no user input data', () => {
          const presenter = new UpdateProbationPractitionerOfficePresenter(
            '1',
            'crn',
            'Norfolk',
            'David',
            'Blake',
            false,
            null,
            null,
            [
              {
                probationOfficeId: 1,
                name: 'London',
                address: '1A cross street',
                probationRegionId: '3',
                govUkURL: 'url',
                deliusCRSLocationId: '1',
              },
            ]
          )

          expect(presenter.fields.ppProbationOffice).toEqual('Norfolk')
        })
      })

      describe('when the referral already has nDelius probation practitioner probation office is set and uses that value as the field value', () => {
        it('the pp probation office value is not changed', () => {
          const presenter = new UpdateProbationPractitionerOfficePresenter(
            '1',
            'crn',
            'Norfolk',
            'David',
            'Blake',
            false,
            null,
            {
              'delius-probation-practitioner-office': 'London',
            },
            []
          )

          expect(presenter.fields.ppProbationOffice).toEqual('London')
        })
      })
    })
  })
})
