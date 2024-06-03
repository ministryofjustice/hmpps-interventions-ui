import draftReferralFactory from '../../../../../testutils/factories/draftReferral'
import ExpectedProbationOfficeUnknownPresenter from './expectedProbationOfficeUnknownPresenter'

describe('ExpectedProbationOfficeUnknownPresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedProbationOfficeUnknownPresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedProbationOfficeUnknownPresenter(referral, {
          errors: [
            {
              formFields: ['probation-office-unknown-reason'],
              errorSummaryLinkedField: 'probation-office-unknown-reason',
              message: 'probation-office-unknown-reason msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'probation-office-unknown-reason', message: 'probation-office-unknown-reason msg' },
        ])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey' } })
      const presenter = new ExpectedProbationOfficeUnknownPresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/expected-probation-office`)
      expect(presenter.text).toEqual({
        title: `Enter why the expected probation office is not known`,
        label: 'Geoffrey River (CRN: X123456)',
        probationOfficeUnknownReason: {
          errorMessage: null,
        },
      })
    })
  })

  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedProbationOfficeUnknownPresenter(referral)

        expect(presenter.fields.probationOfficeUnknownReason).toBe('')
      })
    })

    describe('when there is data on the referral', () => {
      it('replays the data from the referral', () => {
        const referral = draftReferralFactory.build({
          expectedProbationOfficeUnKnownReason: 'reason',
        })
        const presenter = new ExpectedProbationOfficeUnknownPresenter(referral)

        expect(presenter.fields.probationOfficeUnknownReason).toBe('reason')
      })
    })
  })
})
