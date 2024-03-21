import CurrentLocationPresenter from './currentLocationPresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('CurrentLocationPresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CurrentLocationPresenter(referral, [], 'london', null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CurrentLocationPresenter(referral, [], 'london', {
          errors: [
            {
              formFields: ['prison-select'],
              errorSummaryLinkedField: 'prison-select',
              message: 'prison-select msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([{ field: 'prison-select', message: 'prison-select msg' }])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
      const presenter = new CurrentLocationPresenter(referral, [], 'Moorland (HMP & YOI)')

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/form`)
      expect(presenter.text).toEqual({
        title: 'Confirm Geoffrey Blue’s current location',
        label: `Geoffrey Blue (CRN: ${referral.serviceUser?.crn})`,
        subTitle: `Is Geoffrey Blue in Moorland (HMP & YOI)?`,
        submitLocationInput: {
          label: 'Which establishment is Geoffrey in?',
          hint: 'Start typing prison name, then choose from the list.',
          errorMessage: null,
        },
        warningText: `If Geoffrey's location changes, you will need to make direct contact with the service provider.`,
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey' } })
        const presenter = new CurrentLocationPresenter(referral, [], 'london', {
          errors: [
            {
              formFields: ['prison-select'],
              errorSummaryLinkedField: 'prison-select',
              message: 'prison-select msg',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          submitLocationInput: {
            errorMessage: 'prison-select msg',
          },
        })
      })
    })
  })
})
