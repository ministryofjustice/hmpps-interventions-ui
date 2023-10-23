import CommunityAllocatedPresenter from './communityAllocatedPresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('CommunityAllocatedPresenter', () => {
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CommunityAllocatedPresenter(referral, null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CommunityAllocatedPresenter(referral, {
          errors: [
            {
              formFields: ['community-allocated'],
              errorSummaryLinkedField: 'community-allocated',
              message: 'community-allocated msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([{ field: 'community-allocated', message: 'community-allocated msg' }])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
      const presenter = new CommunityAllocatedPresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/intervention/${referral.interventionId}/refer?`)
      expect(presenter.text).toEqual({
        title: `Does Geoffrey Blue have an allocated community probation practitioner?`,
        description: `Geoffrey Blue (CRN: X123456)`,
        communityAllocated: {
          errorMessage: null,
          allocated: `Yes - Geoffrey has an allocated probation practitioner (community offender manager) on nDelius`,
          notAllocated: `No - Geoffrey does not have an allocated probation practitioner (community offender manager) on nDelius`,
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
        const presenter = new CommunityAllocatedPresenter(referral, {
          errors: [
            {
              formFields: ['community-allocated'],
              errorSummaryLinkedField: 'community-allocated',
              message: 'community-allocated msg',
            },
          ],
        })

        expect(presenter.text).toEqual({
          title: `Does Geoffrey Blue have an allocated community probation practitioner?`,
          description: `Geoffrey Blue (CRN: X123456)`,
          communityAllocated: {
            errorMessage: 'community-allocated msg',
            allocated: `Yes - Geoffrey has an allocated probation practitioner (community offender manager) on nDelius`,
            notAllocated: `No - Geoffrey does not have an allocated probation practitioner (community offender manager) on nDelius`,
          },
        })
      })
    })
  })
})
