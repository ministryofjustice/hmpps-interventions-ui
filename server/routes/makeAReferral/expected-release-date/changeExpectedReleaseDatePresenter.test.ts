import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ChangeExpectedReleaseDatePresenter from './changeExpectedReleaseDatePresenter'

describe('ChangeExpectedReleaseDatePresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ChangeExpectedReleaseDatePresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ChangeExpectedReleaseDatePresenter(referral, {
          errors: [
            {
              formFields: ['release-date'],
              errorSummaryLinkedField: 'release-date',
              message: 'release-date msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([{ field: 'release-date', message: 'release-date msg' }])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey' } })
      const presenter = new ChangeExpectedReleaseDatePresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/expected-release-date`)
      expect(presenter.text).toEqual({
        title: `Enter Geoffrey River's expected release date`,
        label: 'Geoffrey River (CRN: X123456)',
      })
    })
  })

  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ChangeExpectedReleaseDatePresenter(referral)

        expect(presenter.fields.releaseDate.day.value).toBe('')
        expect(presenter.fields.releaseDate.month.value).toBe('')
        expect(presenter.fields.releaseDate.year.value).toBe('')
      })
    })

    describe('when there is data on the referral', () => {
      it('replays the data from the referral', () => {
        const referral = draftReferralFactory.build({
          hasExpectedReleaseDate: true,
          expectedReleaseDate: '2023-07-22',
        })
        const presenter = new ChangeExpectedReleaseDatePresenter(referral)

        expect(presenter.fields.releaseDate.day.value).toBe('22')
        expect(presenter.fields.releaseDate.month.value).toBe('7')
        expect(presenter.fields.releaseDate.year.value).toBe('2023')
      })
    })
  })
})
