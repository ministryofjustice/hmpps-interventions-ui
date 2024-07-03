import AmendPrisonEstablishmentPresenter from './amendPrisonEstablishmentPresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe('AmendPrisonEstablishmentPresenter', () => {
  const referral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title, reasonForChangeHeading and back link url', () => {
      const presenter = new AmendPrisonEstablishmentPresenter(referral)

      expect(presenter.text.title).toEqual(`Update Alex River's prison establishment`)
      expect(presenter.text.reasonForChangeHeading).toEqual('What is the reason for changing the prison?')
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendPrisonEstablishmentPresenter(referral)
        expect(presenter.text.submitLocationInput.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendPrisonEstablishmentPresenter(referral, [], {
          errors: [
            {
              formFields: ['amend-prison-establishment'],
              errorSummaryLinkedField: 'amend-prison-establishment',
              message: 'Enter prison establishment',
            },
          ],
        })

        expect(presenter.text.submitLocationInput.errorMessage).toEqual('Enter prison establishment')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendPrisonEstablishmentPresenter(referral)
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendPrisonEstablishmentPresenter(referral, [], {
          errors: [
            {
              formFields: ['amend-prison-establishment'],
              errorSummaryLinkedField: 'amend-prison-establishment',
              message: 'Enter prison establishment',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'amend-prison-establishment',
            message: 'Enter prison establishment',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('prison establishment details', () => {
      describe('when reason for referral is set to null', () => {
        const referralWithEmptyReasonForReferral = sentReferralFactory.build({
          referral: {
            personCustodyPrisonId: null,
          },
        })
        it('uses an null value as the field value', () => {
          const presenter = new AmendPrisonEstablishmentPresenter(referralWithEmptyReasonForReferral)

          expect(presenter.fields.prisonEstablishment).toEqual('')
        })
      })

      describe('when there is a user input data then the already set ndelius pp name is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new AmendPrisonEstablishmentPresenter(referral, [], null, {
            'amend-prison-establishment': `Bronzefield (HMP & YOI)`,
            'reason-for-change': 'some reason',
          })

          expect(presenter.fields.prisonEstablishment).toEqual(`Bronzefield (HMP & YOI)`)
          expect(presenter.fields.reasonForChange).toEqual(`some reason`)
        })
      })
    })
  })
})
