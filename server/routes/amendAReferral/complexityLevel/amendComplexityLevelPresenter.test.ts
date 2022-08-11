import serviceCategoryFactory from '../../../../testutils/factories/serviceCategory'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'
import AmendComplexityLevelPresenter from './amendComplexityLevelPresenter'

describe('AmendComplexityLevelPresenter', () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
  const sentReferral = sentReferralFactory.build()

  describe('complexityDescriptions', () => {
    it('sets each complexity level ID as the `value` on the presenter', () => {
      const presenter = new AmendComplexityLevelPresenter(sentReferral, [], serviceCategory)

      const expectedValues = presenter.complexityDescriptions.map(description => description.value).sort()
      const complexityLevelIds = serviceCategory.complexityLevels
        .map((complexityLevel: { id: string }) => complexityLevel.id)
        .sort()

      expect(expectedValues).toEqual(complexityLevelIds)
    })

    it('sets each complexity level title as the `title` on the presenter', () => {
      const presenter = new AmendComplexityLevelPresenter(sentReferral, [], serviceCategory)

      const expectedTitles = presenter.complexityDescriptions.map(description => description.title).sort()
      const complexityLevelIds = serviceCategory.complexityLevels.map(complexityLevel => complexityLevel.title).sort()

      expect(expectedTitles).toEqual(complexityLevelIds)
    })

    it('sets each complexity level description as the `hint` text on the presenter', () => {
      const presenter = new AmendComplexityLevelPresenter(sentReferral, [], serviceCategory)

      const expectedHints = presenter.complexityDescriptions.map(description => description.hint).sort()
      const complexityLevelIds = serviceCategory.complexityLevels
        .map(complexityLevel => complexityLevel.description)
        .sort()

      expect(expectedHints).toEqual(complexityLevelIds)
    })

    describe('when the referral already has a selected complexity level for the service category', () => {
      it('sets checked to true for the referral’s selected complexity level for the service category', () => {
        const referralComplexityLevels = [
          {
            serviceCategoryId: serviceCategory.id,
            complexityLevelId: serviceCategory.complexityLevels[1].id,
          },
        ]

        const presenter = new AmendComplexityLevelPresenter(sentReferral, referralComplexityLevels, serviceCategory)

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })

    describe('when there is user input data', () => {
      it('sets checked to true for the complexity level that the user chose', () => {
        const presenter = new AmendComplexityLevelPresenter(sentReferral, [], serviceCategory, null, {
          'complexity-level-id': serviceCategory.complexityLevels[1].id,
        })

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })

    describe('when the referral already has a selected complexity level for the service category and there is user input data', () => {
      it('sets checked to true for the complexity level that the user chose', () => {
        const referralComplexityLevels = [
          {
            serviceCategoryId: serviceCategory.id,
            complexityLevelId: serviceCategory.complexityLevels[0].id,
          },
        ]

        const presenter = new AmendComplexityLevelPresenter(
          sentReferral,
          referralComplexityLevels,
          serviceCategory,
          null,
          {
            'complexity-level-id': serviceCategory.complexityLevels[1].id,
          }
        )

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new AmendComplexityLevelPresenter(sentReferral, [], serviceCategory)

      expect(presenter.title).toEqual(`What's the new complexity level for ${serviceCategory.name}?`)
    })
  })
})
