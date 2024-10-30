import AmendProbationPractitionerPhoneNumberPresenter from './amendProbationPractitionerPhoneNumberPresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe('AmendProbationPractitionerPhoneNumberPresenter', () => {
  const referral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referral)

      expect(presenter.text.title).toEqual('Update probation practitioner phone number')
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referral)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-phone-number'],
              errorSummaryLinkedField: 'amend-probation-practitioner-phone-number',
              message: 'Enter probation practitioner phone number',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Enter probation practitioner phone number')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-phone-number'],
              errorSummaryLinkedField: 'amend-probation-practitioner-phone-number',
              message: 'Enter probation practitioner phone number',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'amend-probation-practitioner-phone-number',
            message: 'Enter probation practitioner phone number',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('pp phone number details', () => {
      describe('when no pp phone number have been set', () => {
        const referralWithEmptyPhoneNumber = sentReferralFactory.build({
          referral: {
            ppPhoneNumber: '',
          },
        })
        it('uses an empty string value as the field value', () => {
          const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referralWithEmptyPhoneNumber)

          expect(presenter.fields.ppPhoneNumber).toEqual('')
        })
      })

      describe('when pp phone number is set to null', () => {
        const referralWithEmptyPhoneNumber = sentReferralFactory.build({
          referral: {
            ppPhoneNumber: null,
          },
        })
        it('uses an null value as the field value', () => {
          const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referralWithEmptyPhoneNumber)

          expect(presenter.fields.ppPhoneNumber).toEqual('')
        })
      })

      describe('when there is a user input data then the already set ndelius pp phone number is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new AmendProbationPractitionerPhoneNumberPresenter(referral, null, {
            'amend-probation-practitioner-phone-number': '1111111111',
          })

          expect(presenter.fields.ppPhoneNumber).toEqual('1111111111')
        })
      })
    })
  })
})
