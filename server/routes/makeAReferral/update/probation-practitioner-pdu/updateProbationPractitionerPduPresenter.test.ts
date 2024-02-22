import UpdateProbationPractitionerPduPresenter from './updateProbationPractitionerPduPresenter'

describe(UpdateProbationPractitionerPduPresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new UpdateProbationPractitionerPduPresenter(
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
            pduId: 1,
            name: 'Norfolk',
            probationRegionId: 'Lond',
          },
        ]
      )

      expect(presenter.text.title).toEqual('Update PDU (Probation Delivery Unit)')
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
      expect(presenter.text.inputHeading).toEqual('PDU (Probation Delivery Unit)')
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new UpdateProbationPractitionerPduPresenter(
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
        const presenter = new UpdateProbationPractitionerPduPresenter(
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
    describe('updateProbationPractitionerPdu', () => {
      describe('when no probation practitioner pdu have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new UpdateProbationPractitionerPduPresenter(
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

          expect(presenter.fields.ppPdu).toEqual('')
        })
      })

      describe('when the referral already has nDelius probation practitioner pdu is set and there is no user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerPduPresenter(
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
                pduId: 1,
                name: 'London',
                probationRegionId: 'Lond',
              },
            ]
          )

          expect(presenter.fields.ppPdu).toEqual('Norfolk')
        })
      })

      describe('when there is a user input data then the already set ndelius pp pdu is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new UpdateProbationPractitionerPduPresenter(
            '1',
            'crn',
            'Norfolk',
            'David',
            'Blake',
            false,
            null,
            {
              'delius-probation-practitioner-pdu': 'London',
            },
            []
          )

          expect(presenter.fields.ppPdu).toEqual('London')
        })
      })
    })
  })
})
