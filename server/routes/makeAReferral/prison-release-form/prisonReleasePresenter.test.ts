import PrisonReleasePresenter from './prisonReleasePresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('PrisonReleasePresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new PrisonReleasePresenter(referral, null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new PrisonReleasePresenter(referral, {
          errors: [
            {
              formFields: ['prison-release'],
              errorSummaryLinkedField: 'prison-release',
              message: 'prison-release msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([{ field: 'prison-release', message: 'prison-release msg' }])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
      const presenter = new PrisonReleasePresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/intervention/${referral.interventionId}/refer?`)
      expect(presenter.text).toEqual({
        title: 'Will Geoffrey Blue be released during the intervention?',
        description: 'Geoffrey Blue (CRN: X123456)',
        fromPrison: {
          errorMessage: null,
          notReleased:
            'No - Geoffrey has just arrived in prison and has immediate intervention needs (such as ending a tenancy)',
          released: 'Yes',
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
        const presenter = new PrisonReleasePresenter(referral, {
          errors: [
            {
              formFields: ['prison-release'],
              errorSummaryLinkedField: 'prison-release',
              message: 'prison-release msg',
            },
          ],
        })

        expect(presenter.text).toEqual({
          title: 'Will Geoffrey Blue be released during the intervention?',
          description: 'Geoffrey Blue (CRN: X123456)',
          fromPrison: {
            errorMessage: 'prison-release msg',
            notReleased:
              'No - Geoffrey has just arrived in prison and has immediate intervention needs (such as ending a tenancy)',
            released: 'Yes',
          },
        })
      })
    })
  })
})
