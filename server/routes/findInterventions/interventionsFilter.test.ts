import { Request } from 'express'
import InterventionsFilter from './interventionsFilter'

describe(InterventionsFilter, () => {
  describe('.fromRequest', () => {
    it('creates a filter from the request’s query params', () => {
      const query = { 'pcc-region-ids': ['a', 'b', 'c'], gender: ['male'], age: ['18-to-25-only'] }

      const filter = InterventionsFilter.fromRequest(({ query } as unknown) as Request)

      expect(filter.pccRegionIds).toEqual(['a', 'b', 'c'])
      expect(filter.gender).toEqual(['male'])
      expect(filter.age).toEqual(['18-to-25-only'])
    })
  })

  describe('params', () => {
    it('correctly sets pccRegionIds', () => {
      const filter = new InterventionsFilter()

      expect(filter.params.pccRegionIds).toBeUndefined()

      filter.pccRegionIds = ['a', 'b', 'c']
      expect(filter.pccRegionIds).toEqual(['a', 'b', 'c'])
    })

    it('correctly sets allowsMale', () => {
      const filter = new InterventionsFilter()

      expect(filter.params.allowsMale).toBeUndefined()

      filter.gender = ['female']
      expect(filter.params.allowsMale).toBeUndefined()

      filter.gender = ['male']
      expect(filter.params.allowsMale).toBe(true)

      filter.gender = ['male', 'female']
      expect(filter.params.allowsMale).toBe(true)
    })

    it('correctly sets allowsFemale', () => {
      const filter = new InterventionsFilter()

      expect(filter.params.allowsFemale).toBeUndefined()

      filter.gender = ['male']
      expect(filter.params.allowsFemale).toBeUndefined()

      filter.gender = ['female']
      expect(filter.params.allowsFemale).toBe(true)

      filter.gender = ['male', 'female']
      expect(filter.params.allowsFemale).toBe(true)
    })

    it('correctly sets maximumAge', () => {
      const filter = new InterventionsFilter()

      expect(filter.params.maximumAge).toBeUndefined()

      filter.age = ['18-to-25-only']
      expect(filter.params.maximumAge).toBe(25)
    })
  })
})
