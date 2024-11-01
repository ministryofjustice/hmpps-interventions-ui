import sentReferralFactory from '../../../../testutils/factories/sentReferral'
import AmendProbationPractitionerTeamPhoneNumberPresenter from './amendProbationPractitionerTeamPhoneNumberPresenter'

describe('AmendProbationPractitionerPhoneNumberPresenter', () => {
  const referral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referral)

      expect(presenter.text.title).toEqual('Update team phone number')
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referral)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-team-phone-number'],
              errorSummaryLinkedField: 'amend-probation-practitioner-team-phone-number',
              message: 'Enter team phone number',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Enter team phone number')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-team-phone-number'],
              errorSummaryLinkedField: 'amend-probation-practitioner-team-phone-number',
              message: 'Enter team phone number',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'amend-probation-practitioner-team-phone-number',
            message: 'Enter team phone number',
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
            ppTeamPhoneNumber: '',
          },
        })
        it('uses an empty string value as the field value', () => {
          const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referralWithEmptyPhoneNumber)

          expect(presenter.fields.ppTeamPhoneNumber).toEqual('')
        })
      })

      describe('when pp phone number is set to null', () => {
        const referralWithEmptyPhoneNumber = sentReferralFactory.build({
          referral: {
            ppTeamPhoneNumber: null,
          },
        })
        it('uses an null value as the field value', () => {
          const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referralWithEmptyPhoneNumber)

          expect(presenter.fields.ppTeamPhoneNumber).toEqual('')
        })
      })

      describe('when there is a user input data then the already set ndelius pp team phone number is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new AmendProbationPractitionerTeamPhoneNumberPresenter(referral, null, {
            'amend-probation-practitioner-team-phone-number': '1111111111',
          })

          expect(presenter.fields.ppTeamPhoneNumber).toEqual('1111111111')
        })
      })
    })
  })
})
