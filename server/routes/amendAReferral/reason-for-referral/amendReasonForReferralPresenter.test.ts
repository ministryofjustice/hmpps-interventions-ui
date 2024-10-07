import AmendReasonForReferralPresenter from './amendReasonForReferralPresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe('AmendReasonForReferralPresenter', () => {
  const referral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new AmendReasonForReferralPresenter(referral)

      expect(presenter.text.title).toEqual(
        'Provide the reason for this referral and further information for the service provider'
      )
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendReasonForReferralPresenter(referral)

        expect(presenter.reasonForReferralErrorMessage).toBeNull()
        expect(presenter.reasonForReferralFurtherInformationErrorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendReasonForReferralPresenter(referral, {
          errors: [
            {
              formFields: ['amend-reason-for-referral'],
              errorSummaryLinkedField: 'amend-reason-for-referral',
              message: 'Enter reason for the referral and any further information',
            },
          ],
        })

        expect(presenter.reasonForReferralErrorMessage).toEqual(
          'Enter reason for the referral and any further information'
        )
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendReasonForReferralPresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendReasonForReferralPresenter(referral, {
          errors: [
            {
              formFields: ['amend-reason-for-referral'],
              errorSummaryLinkedField: 'amend-reason-for-referral',
              message: 'Enter reason for the referral and any further information',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'amend-reason-for-referral',
            message: 'Enter reason for the referral and any further information',
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
            reasonForReferral: '',
          },
        })
        it('uses an empty string value as the field value', () => {
          const presenter = new AmendReasonForReferralPresenter(referralWithEmptyReasonForReferral)

          expect(presenter.fields.reasonForReferral).toEqual('')
        })
      })

      describe('when reason for referral is set to null', () => {
        const referralWithEmptyReasonForReferral = sentReferralFactory.build({
          referral: {
            reasonForReferral: null,
          },
        })
        it('uses an null value as the field value', () => {
          const presenter = new AmendReasonForReferralPresenter(referralWithEmptyReasonForReferral)

          expect(presenter.fields.reasonForReferral).toEqual('')
        })
      })

      describe('when there is a user input data then the already set ndelius pp name is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new AmendReasonForReferralPresenter(referral, null, {
            'amend-reason-for-referral': 'To allocating the referral through CRS',
          })

          expect(presenter.fields.reasonForReferral).toEqual('To allocating the referral through CRS')
        })
      })
    })
  })
})
