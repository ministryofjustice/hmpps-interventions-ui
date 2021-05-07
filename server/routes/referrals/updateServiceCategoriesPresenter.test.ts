import draftReferral from '../../../testutils/factories/draftReferral'
import serviceCategory from '../../../testutils/factories/serviceCategory'
import UpdateServiceCategoriesPresenter from './updateServiceCategoriesPresenter'

describe(UpdateServiceCategoriesPresenter, () => {
  describe('text', () => {
    it("contains a title including the Service User's name", () => {
      const referral = draftReferral.serviceUserSelected().build()
      const serviceCategoriesFromIntervention = serviceCategory.buildList(2)

      const presenter = new UpdateServiceCategoriesPresenter(referral, serviceCategoriesFromIntervention)

      expect(presenter.text.title).toEqual('What service types are you referring Alex to?')
    })
  })

  describe('hasSelectedServiceCategory', () => {
    describe('when the referral has not had any service categories selected', () => {
      it('returns false for the specified service categories', () => {
        const referral = draftReferral.build()
        const serviceCategoriesFromIntervention = serviceCategory.buildList(2)

        const presenter = new UpdateServiceCategoriesPresenter(referral, serviceCategoriesFromIntervention)

        expect(presenter.hasSelectedServiceCategory(serviceCategoriesFromIntervention[0].id)).toEqual(false)
        expect(presenter.hasSelectedServiceCategory(serviceCategoriesFromIntervention[1].id)).toEqual(false)
      })
    })

    describe('when the referral has already had service categories selected', () => {
      it('returns true for the specified service categories', () => {
        const firstSelectedServiceCategory = serviceCategory.build()
        const secondSelectedServiceCategory = serviceCategory.build()
        const unselectedServiceCategory = serviceCategory.build()

        const serviceCategoriesFromIntervention = [
          firstSelectedServiceCategory,
          secondSelectedServiceCategory,
          unselectedServiceCategory,
        ]

        const referral = draftReferral.build({
          serviceCategoryIds: [firstSelectedServiceCategory.id, secondSelectedServiceCategory.id],
        })

        const presenter = new UpdateServiceCategoriesPresenter(referral, serviceCategoriesFromIntervention)

        expect(presenter.hasSelectedServiceCategory(firstSelectedServiceCategory.id)).toEqual(true)
        expect(presenter.hasSelectedServiceCategory(secondSelectedServiceCategory.id)).toEqual(true)
        expect(presenter.hasSelectedServiceCategory(unselectedServiceCategory.id)).toEqual(false)
      })
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const referral = draftReferral.serviceUserSelected().build()
        const serviceCategoriesFromIntervention = serviceCategory.buildList(2)

        const presenter = new UpdateServiceCategoriesPresenter(referral, serviceCategoriesFromIntervention)
        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const referral = draftReferral.serviceUserSelected().build()
        const serviceCategoriesFromIntervention = serviceCategory.buildList(2)

        const presenter = new UpdateServiceCategoriesPresenter(referral, serviceCategoriesFromIntervention, {
          errors: [
            {
              formFields: ['service-category-ids'],
              errorSummaryLinkedField: 'service-category-ids',
              message: 'At least one service type must be selected',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('At least one service type must be selected')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const referral = draftReferral.serviceUserSelected().build()
        const serviceCategoriesFromIntervention = serviceCategory.buildList(2)

        const presenter = new UpdateServiceCategoriesPresenter(referral, serviceCategoriesFromIntervention)
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const referral = draftReferral.serviceUserSelected().build()
        const serviceCategoriesFromIntervention = serviceCategory.buildList(2)

        const presenter = new UpdateServiceCategoriesPresenter(referral, serviceCategoriesFromIntervention, {
          errors: [
            {
              formFields: ['service-category-ids'],
              errorSummaryLinkedField: 'service-category-ids',
              message: 'At least one service type must be selected',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'service-category-ids', message: 'At least one service type must be selected' },
        ])
      })
    })
  })
})
