import ExpectedReleaseDatePresenter from './expectedReleaseDatePresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('ExpectedReleaseDatePresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedReleaseDatePresenter(referral)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedReleaseDatePresenter(referral, {
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
      const presenter = new ExpectedReleaseDatePresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/submit-current-location`)
      expect(presenter.text).toEqual({
        title: 'Do you know the expected release date?',
        description: 'You can find this in nDelius and NOMIS',
        label: 'Geoffrey River (CRN: X123456)',
        releaseDate: {
          label: 'Add the expected release date',
        },
        releaseDateUnknownReason: {
          label: 'Enter why the expected release date is not known',
          errorMessage: null,
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey' } })
        const presenter = new ExpectedReleaseDatePresenter(referral, {
          errors: [
            {
              formFields: ['release-date-unknown-reason'],
              errorSummaryLinkedField: 'release-date-unknown-reason',
              message: 'release-date-unknown-reason msg',
            },
            {
              formFields: ['release-date-day'],
              errorSummaryLinkedField: 'release-date-day',
              message: 'The expected release date must include a day',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          releaseDate: {
            label: 'Add the expected release date',
          },
          releaseDateUnknownReason: {
            label: 'Enter why the expected release date is not known',
            errorMessage: 'release-date-unknown-reason msg',
          },
        })
      })
    })
  })

  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referral = draftReferralFactory.build()
        const presenter = new ExpectedReleaseDatePresenter(referral)

        expect(presenter.fields.hasExpectedReleaseDate).toBe(null)
        expect(presenter.fields.releaseDateUnknownReason).toBe('')
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
          expectedReleaseDateMissingReason: '',
        })
        const presenter = new ExpectedReleaseDatePresenter(referral)

        expect(presenter.fields.hasExpectedReleaseDate).toBe(true)
        expect(presenter.fields.releaseDateUnknownReason).toBe('')
        expect(presenter.fields.releaseDate.day.value).toBe('22')
        expect(presenter.fields.releaseDate.month.value).toBe('7')
        expect(presenter.fields.releaseDate.year.value).toBe('2023')
      })
    })
  })
})
