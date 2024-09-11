import AmendProbationPractitionerNamePresenter from './amendProbationPractitionerNamePresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe('AmendProbationPractitionerNamePresenter', () => {
  const referral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new AmendProbationPractitionerNamePresenter(referral)

      expect(presenter.text.title).toEqual('Update probation practitioner name')
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerNamePresenter(referral)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendProbationPractitionerNamePresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-name'],
              errorSummaryLinkedField: 'amend-probation-practitioner-name',
              message: 'Enter probation practitioner name',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Enter probation practitioner name')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationPractitionerNamePresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendProbationPractitionerNamePresenter(referral, {
          errors: [
            {
              formFields: ['amend-probation-practitioner-name'],
              errorSummaryLinkedField: 'amend-probation-practitioner-name',
              message: 'Enter probation practitioner name',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'amend-probation-practitioner-name',
            message: 'Enter probation practitioner name',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('reason for referral details', () => {
      describe('when no reason for referral have been set', () => {
        const referralWithEmptyReasonForReferral = sentReferralFactory.build({
          referral: {
            ppName: '',
          },
        })
        it('uses an empty string value as the field value', () => {
          const presenter = new AmendProbationPractitionerNamePresenter(referralWithEmptyReasonForReferral)

          expect(presenter.fields.ppName).toEqual('')
        })
      })

      describe('when reason for referral is set to null', () => {
        const referralWithEmptyReasonForReferral = sentReferralFactory.build({
          referral: {
            ppName: null,
          },
        })
        it('uses an null value as the field value', () => {
          const presenter = new AmendProbationPractitionerNamePresenter(referralWithEmptyReasonForReferral)

          expect(presenter.fields.ppName).toEqual('')
        })
      })

      describe('when there is a user input data then the already set ndelius pp name is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new AmendProbationPractitionerNamePresenter(referral, null, {
            'amend-probation-practitioner-name': 'Bob Marley',
          })

          expect(presenter.fields.ppName).toEqual('Bob Marley')
        })
      })
    })
  })
})
