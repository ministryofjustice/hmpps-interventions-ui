import AmendExpectedReleaseDatePresenter from './amendExpectedReleaseDatePresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe('AmendExpectedReleaseDatePresenter', () => {
  const referral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title, reasonForChangeHeading and back link url', () => {
      const presenter = new AmendExpectedReleaseDatePresenter(referral)

      expect(presenter.text.title).toEqual(`Update Alex River's expected release date`)
      expect(presenter.text.reasonForChangeHeading).toEqual('Enter why the expected release date is not known')
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendExpectedReleaseDatePresenter(referral, {
          errors: [
            {
              formFields: ['amend-expected-release-date'],
              errorSummaryLinkedField: 'amend-expected-release-date',
              message: 'Enter expected release date',
            },
            {
              formFields: ['amend-date-unknown-reason'],
              errorSummaryLinkedField: 'amend-date-unknown-reason',
              message: 'Enter expected release date unknown reason',
            },
          ],
        })
        expect(presenter.text.reasonForChangeErrorMessage).toEqual('Enter expected release date unknown reason')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendExpectedReleaseDatePresenter(referral)
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendExpectedReleaseDatePresenter(referral, {
          errors: [
            {
              formFields: ['amend-expected-release-date'],
              errorSummaryLinkedField: 'amend-expected-release-date',
              message: 'Enter expected release date',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'amend-expected-release-date',
            message: 'Enter expected release date',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referralWithEmptyExpectedReleaseDate = sentReferralFactory.build({
          referral: {
            expectedReleaseDate: '',
          },
        })
        const presenter = new AmendExpectedReleaseDatePresenter(referralWithEmptyExpectedReleaseDate)

        expect(presenter.fields.expectedReleaseDate.day.value).toBe('')
        expect(presenter.fields.expectedReleaseDate.month.value).toBe('')
        expect(presenter.fields.expectedReleaseDate.year.value).toBe('')
      })
    })

    describe('when there is expected release date on the referral', () => {
      it('replays the expected release date from the referral', () => {
        const referralWithExpectedReleaseDate = sentReferralFactory.build({
          referral: {
            expectedReleaseDate: '2023-07-22',
          },
        })
        const presenter = new AmendExpectedReleaseDatePresenter(referralWithExpectedReleaseDate)

        expect(presenter.fields.expectedReleaseDate.day.value).toBe('22')
        expect(presenter.fields.expectedReleaseDate.month.value).toBe('7')
        expect(presenter.fields.expectedReleaseDate.year.value).toBe('2023')
      })
    })

    describe('when there is expected release unknown reason on the referral', () => {
      it('replays the expected release unknown reason from the referral', () => {
        const referralWithExpectedReleaseUnKnownReason = sentReferralFactory.build({
          referral: {
            expectedReleaseDateMissingReason: 'some reason',
          },
        })
        const presenter = new AmendExpectedReleaseDatePresenter(referralWithExpectedReleaseUnKnownReason)

        expect(presenter.fields.expectedReleaseDateUnknownReason).toBe('some reason')
      })
    })
  })
})
