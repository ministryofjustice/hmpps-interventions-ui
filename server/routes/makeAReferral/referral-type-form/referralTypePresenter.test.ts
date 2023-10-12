import ReferralTypePresenter from './referralTypePresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('ReferralTypePresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new ReferralTypePresenter(referral, null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new ReferralTypePresenter(referral, {
          errors: [
            {
              formFields: ['current-location'],
              errorSummaryLinkedField: 'current-location',
              message: 'current-location msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([{ field: 'current-location', message: 'current-location msg' }])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
      const presenter = new ReferralTypePresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/intervention/${referral.interventionId}/refer?`)
      expect(presenter.text).toEqual({
        title: 'What type of referral is this?',
        description: 'Geoffrey Blue (CRN: X123456)',
        currentLocation: {
          label: 'Geoffrey Blue is currently:',
          errorMessage: null,
          custodyLabel: 'In prison (pre-release)',
          communityLabel: 'In the community',
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey' } })
        const presenter = new ReferralTypePresenter(referral, {
          errors: [
            {
              formFields: ['current-location'],
              errorSummaryLinkedField: 'current-location',
              message: 'current-location msg',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          currentLocation: {
            errorMessage: 'current-location msg',
          },
        })
      })
    })
  })
})
