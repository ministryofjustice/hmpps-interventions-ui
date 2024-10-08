import AmendProbationPractitionerEmailPresenter from './amendProbationPractitionerEmailPresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe('AmendProbationPractitionerEmailPresenter', () => {
  const referral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new AmendProbationPractitionerEmailPresenter(referral)

      expect(presenter.text.title).toEqual('Update probation practitioner email address')
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerEmailPresenter(referral)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendProbationPractitionerEmailPresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-email'],
              errorSummaryLinkedField: 'amend-probation-practitioner-email',
              message: 'Enter probation practitioner email address',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Enter probation practitioner email address')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerEmailPresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendProbationPractitionerEmailPresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-email'],
              errorSummaryLinkedField: 'amend-probation-practitioner-email',
              message: 'Enter probation practitioner email address',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'amend-probation-practitioner-email',
            message: 'Enter probation practitioner email address',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('pp email details', () => {
      describe('when no pp email have been set', () => {
        const referralWithEmptyEmail = sentReferralFactory.build({
          referral: {
            ppEmailAddress: '',
          },
        })
        it('uses an empty string value as the field value', () => {
          const presenter = new AmendProbationPractitionerEmailPresenter(referralWithEmptyEmail)

          expect(presenter.fields.ppEmailAddress).toEqual('')
        })
      })

      describe('when pp email is set to null', () => {
        const referralWithEmptyEmail = sentReferralFactory.build({
          referral: {
            ppEmailAddress: null,
          },
        })
        it('uses an null value as the field value', () => {
          const presenter = new AmendProbationPractitionerEmailPresenter(referralWithEmptyEmail)

          expect(presenter.fields.ppEmailAddress).toEqual('')
        })
      })

      describe('when there is a user input data then the already set ndelius pp email is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new AmendProbationPractitionerEmailPresenter(referral, null, {
            'amend-probation-practitioner-email': 'bob.marley@somewhere.com',
          })

          expect(presenter.fields.ppEmailAddress).toEqual('bob.marley@somewhere.com')
        })
      })
    })
  })
})
