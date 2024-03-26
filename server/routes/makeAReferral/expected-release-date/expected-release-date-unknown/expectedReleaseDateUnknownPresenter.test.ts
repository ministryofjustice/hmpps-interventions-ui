import draftReferralFactory from '../../../../../testutils/factories/draftReferral'
import ExpectedReleaseDateUnknownPresenter from './expectedReleaseDateUnknownPresenter'

describe('ExpectedReleaseDateUnknownPresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedReleaseDateUnknownPresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedReleaseDateUnknownPresenter(referral, {
          errors: [
            {
              formFields: ['release-date-unknown-reason'],
              errorSummaryLinkedField: 'release-date-unknown-reason',
              message: 'release-date-unknown-reason msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'release-date-unknown-reason', message: 'release-date-unknown-reason msg' },
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
      const presenter = new ExpectedReleaseDateUnknownPresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/expected-release-date`)
      expect(presenter.text).toEqual({
        title: `Enter why the expected release date is not known`,
        label: 'Geoffrey River (CRN: X123456)',
        releaseDateUnknownReason: {
          errorMessage: null,
        },
      })
    })
  })

  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedReleaseDateUnknownPresenter(referral)

        expect(presenter.fields.releaseDateUnknownReason).toBe('')
      })
    })

    describe('when there is data on the referral', () => {
      it('replays the data from the referral', () => {
        const referral = draftReferralFactory.build({
          expectedReleaseDateMissingReason: 'reason',
        })
        const presenter = new ExpectedReleaseDateUnknownPresenter(referral)

        expect(presenter.fields.releaseDateUnknownReason).toBe('reason')
      })
    })
  })
})
