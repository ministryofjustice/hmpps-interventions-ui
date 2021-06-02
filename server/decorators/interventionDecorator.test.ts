import InterventionDecorator from './interventionDecorator'
import interventionFactory from '../../testutils/factories/intervention'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'

describe(InterventionDecorator, () => {
  describe('isCohortIntervention', () => {
    it('returns false when the intervention has a single service category', () => {
      const intervention = interventionFactory.build({ serviceCategories: [serviceCategoryFactory.build()] })
      const decorator = new InterventionDecorator(intervention)

      expect(decorator.isCohortIntervention).toEqual(false)
    })

    it('returns true when the intervention has multiple service categories', () => {
      const intervention = interventionFactory.build({
        serviceCategories: [serviceCategoryFactory.build(), serviceCategoryFactory.build()],
      })
      const decorator = new InterventionDecorator(intervention)

      expect(decorator.isCohortIntervention).toEqual(true)
    })
  })
})
