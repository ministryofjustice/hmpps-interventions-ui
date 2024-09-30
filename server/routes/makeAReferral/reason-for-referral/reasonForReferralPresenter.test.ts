import ReasonForReferralPresenter from './reasonForReferralPresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('ReasonForReferralPresenter', () => {
  const referral = draftReferralFactory.build({
    serviceUser: {
      crn: 'crn',
      title: null,
      firstName: 'David',
      lastName: 'Blake',
      dateOfBirth: null,
      gender: null,
      ethnicity: null,
      preferredLanguage: null,
      religionOrBelief: null,
      disabilities: null,
    },
  })
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new ReasonForReferralPresenter(referral)

      expect(presenter.text.title).toEqual(
        'Provide the reason for this referral and further information for the service provider'
      )
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new ReasonForReferralPresenter(referral)

        expect(presenter.reasonForReferralErrorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new ReasonForReferralPresenter(referral, false, false, {
          errors: [
            {
              formFields: ['reason-for-referral'],
              errorSummaryLinkedField: 'reason-for-referral',
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
        const presenter = new ReasonForReferralPresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new ReasonForReferralPresenter(referral, false, false, {
          errors: [
            {
              formFields: ['reason-for-referral'],
              errorSummaryLinkedField: 'reason-for-referral',
              message: 'Enter reason for the referral and any further information',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'reason-for-referral',
            message: 'Enter reason for the referral and any further information',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('reason for referral details', () => {
      describe('when no reason for referral have been set', () => {
        const referralWithEmptyReasonForReferral = draftReferralFactory.build({
          reasonForReferral: '',
        })
        it('uses an empty string value as the field value', () => {
          const presenter = new ReasonForReferralPresenter(referralWithEmptyReasonForReferral)

          expect(presenter.fields.reasonForReferral).toEqual('')
        })
      })

      describe('when reason for referral is set to null', () => {
        const referralWithEmptyReasonForReferral = draftReferralFactory.build({
          reasonForReferral: null,
        })
        it('uses an null value as the field value', () => {
          const presenter = new ReasonForReferralPresenter(referralWithEmptyReasonForReferral)

          expect(presenter.fields.reasonForReferral).toEqual('')
        })
      })

      describe('when there is a user input data then the already set ndelius pp name is changed', () => {
        it('uses that value as the field value', () => {
          const presenter = new ReasonForReferralPresenter(referral, false, false, null, {
            'reason-for-referral': 'To allocating the referral through CRS',
          })

          expect(presenter.fields.reasonForReferral).toEqual('To allocating the referral through CRS')
        })
      })
      describe('when the reason for referral is called from check all referral information page', () => {
        it('uses that value as the field value', () => {
          const presenter = new ReasonForReferralPresenter(referral, true, false, null, {
            'reason-for-referral': 'To allocating the referral through CRS',
          })
          expect(presenter.backLinkUrl).toEqual(`/referrals/${referral.id}/check-all-referral-information`)
        })
      })
      describe('when the reason for referral is called from referral details page', () => {
        it('uses that value as the field value', () => {
          const presenter = new ReasonForReferralPresenter(referral, false, true, null, {
            'reason-for-referral': 'To allocating the referral through CRS',
          })
          expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
        })
      })
    })
  })
})
