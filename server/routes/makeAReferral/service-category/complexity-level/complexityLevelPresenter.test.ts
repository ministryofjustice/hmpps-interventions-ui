import ComplexityLevelPresenter from './complexityLevelPresenter'
import draftReferralFactory from '../../../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../../../testutils/factories/serviceCategory'

describe('ComplexityLevelPresenter', () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
  const draftReferral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

  describe('complexityDescriptions', () => {
    it('sets each complexity level ID as the `value` on the presenter', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, serviceCategory)

      const expectedValues = presenter.complexityDescriptions.map(description => description.value).sort()
      const complexityLevelIds = serviceCategory.complexityLevels.map(complexityLevel => complexityLevel.id).sort()

      expect(expectedValues).toEqual(complexityLevelIds)
    })

    it('sets each complexity level title as the `title` on the presenter', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, serviceCategory)

      const expectedTitles = presenter.complexityDescriptions.map(description => description.title).sort()
      const complexityLevelIds = serviceCategory.complexityLevels.map(complexityLevel => complexityLevel.title).sort()

      expect(expectedTitles).toEqual(complexityLevelIds)
    })

    it('sets each complexity level description as the `hint` text on the presenter', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, serviceCategory)

      const expectedHints = presenter.complexityDescriptions.map(description => description.hint).sort()
      const complexityLevelIds = serviceCategory.complexityLevels
        .map(complexityLevel => complexityLevel.description)
        .sort()

      expect(expectedHints).toEqual(complexityLevelIds)
    })

    describe('when the referral already has a selected complexity level for the service category', () => {
      it('sets checked to true for the referral’s selected complexity level for the service category', () => {
        draftReferral.complexityLevels = [
          {
            serviceCategoryId: serviceCategory.id,
            complexityLevelId: serviceCategory.complexityLevels[1].id,
          },
        ]
        const presenter = new ComplexityLevelPresenter(draftReferral, serviceCategory)

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })

    describe('when there is user input data', () => {
      it('sets checked to true for the complexity level that the user chose', () => {
        const presenter = new ComplexityLevelPresenter(draftReferral, serviceCategory, null, {
          'complexity-level-id': serviceCategory.complexityLevels[1].id,
        })

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })

    describe('when the referral already has a selected complexity level for the service category and there is user input data', () => {
      it('sets checked to true for the complexity level that the user chose', () => {
        draftReferral.complexityLevels = [
          {
            serviceCategoryId: serviceCategory.id,
            complexityLevelId: serviceCategory.complexityLevels[0].id,
          },
        ]
        const presenter = new ComplexityLevelPresenter(draftReferral, serviceCategory, null, {
          'complexity-level-id': serviceCategory.complexityLevels[1].id,
        })

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, serviceCategory)

      expect(presenter.title).toEqual('What is the complexity level for the Social inclusion service?')
    })
  })
})
