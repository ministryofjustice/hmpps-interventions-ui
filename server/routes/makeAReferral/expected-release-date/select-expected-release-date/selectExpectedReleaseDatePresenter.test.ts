import SelectExpectedReleaseDatePresenter from './selectExpectedReleaseDatePresenter'
import draftReferralFactory from '../../../../../testutils/factories/draftReferral'

describe('SelectExpectedReleaseDatePresenter', () => {
  const releaseDate = '01-01-2025'
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.build()
        const presenter = new SelectExpectedReleaseDatePresenter(referral, false, releaseDate)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.build()
        const presenter = new SelectExpectedReleaseDatePresenter(referral, false, releaseDate, {
          errors: [
            {
              formFields: ['expected-release-date'],
              errorSummaryLinkedField: 'expected-release-date',
              message: 'expected-release-date msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'expected-release-date', message: 'expected-release-date msg' },
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
      const presenter = new SelectExpectedReleaseDatePresenter(referral, false, releaseDate)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/submit-current-location`)
      expect(presenter.text).toEqual({
        title: `Confirm Geoffrey River's expected release date`,
        label: 'Geoffrey River (CRN: X123456)',
      })
    })
  })

  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referral = draftReferralFactory.build()
        const presenter = new SelectExpectedReleaseDatePresenter(referral, false, releaseDate)

        expect(presenter.fields.hasMatchingReleaseDate).toBe(null)
        expect(presenter.fields.releaseDate).toBe('1 January 2025 (Wednesday)')
      })
    })

    describe('when there is data on the referral', () => {
      it('replays the data from the referral', () => {
        const referral = draftReferralFactory.build({
          hasExpectedReleaseDate: true,
          expectedReleaseDate: '2023-07-22',
        })
        const presenter = new SelectExpectedReleaseDatePresenter(referral, false, releaseDate)

        expect(presenter.fields.hasMatchingReleaseDate).toBe(false)
        expect(presenter.fields.releaseDate).toBe('1 January 2025 (Wednesday)')
      })
    })
  })
})
