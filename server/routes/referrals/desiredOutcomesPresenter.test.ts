import DesiredOutcomesPresenter from './desiredOutcomesPresenter'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe('DesiredOutcomesPresenter', () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

  describe('desiredOutcomes', () => {
    it('sets each the id of each desired outcome as the `value` on the presenter', () => {
      const presenter = new DesiredOutcomesPresenter(serviceCategory)

      const expectedValues = presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.value).sort()
      const desiredOutcomeIds = serviceCategory.desiredOutcomes.map(desiredOutcome => desiredOutcome.id).sort()

      expect(expectedValues).toEqual(desiredOutcomeIds)
    })

    it('sets the description of each desired outcome as the `text` on the presenter', () => {
      const presenter = new DesiredOutcomesPresenter(serviceCategory)

      const presenterTexts = presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.text).sort()
      const desiredOutcomeDescriptions = serviceCategory.desiredOutcomes
        .map(desiredOutcome => desiredOutcome.description)
        .sort()

      expect(presenterTexts).toEqual(desiredOutcomeDescriptions)
    })
  })

  describe('error information', () => {
    describe('when no errors are passed in', () => {
      it('returns no errors', () => {
        const presenter = new DesiredOutcomesPresenter(serviceCategory)

        expect(presenter.error).toBeNull()
      })
    })

    describe('when errors are passed in', () => {
      it('returns error information', () => {
        const presenter = new DesiredOutcomesPresenter(serviceCategory, {
          message: 'Select desired outcomes',
        })

        expect(presenter.error).toEqual({ message: 'Select desired outcomes' })
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new DesiredOutcomesPresenter(serviceCategory)

      expect(presenter.title).toEqual('What are the desired outcomes for the social inclusion service?')
    })
  })
})
