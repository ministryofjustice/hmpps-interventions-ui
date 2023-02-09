import CurrentLocationPresenter from './currentLocationPresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('CurrentLocationPresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CurrentLocationPresenter(referral, [], null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CurrentLocationPresenter(referral, [], {
          errors: [
            {
              formFields: ['current-location'],
              errorSummaryLinkedField: 'current-location',
              message: 'current-location msg',
            },
            {
              formFields: ['prison-select'],
              errorSummaryLinkedField: 'prison-select',
              message: 'prison-select msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'current-location', message: 'current-location msg' },
          { field: 'prison-select', message: 'prison-select msg' },
        ])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
      const presenter = new CurrentLocationPresenter(referral, [])

      expect(presenter.text).toEqual({
        title: 'Submit Geoffrey Blue’s current location',
        description:
          'This enables the service provider to prioritise the intervention and allocate it to the right caseworker.',
        currentLocation: {
          label: 'Where is Geoffrey today?',
          errorMessage: null,
          custodyLabel: 'Custody (select even if Geoffrey is due to be released today)',
          communityLabel: 'Community',
        },
        submitLocationInput: {
          label: 'Which establishment is Geoffrey in?',
          hint: 'Start typing, then choose from the list.',
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
        const presenter = new CurrentLocationPresenter(referral, [], {
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
          submitLocationInput: {
            errorMessage: null,
          },
        })
      })
    })
  })
})
