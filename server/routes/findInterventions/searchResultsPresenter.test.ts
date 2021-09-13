import SearchResultsPresenter from './searchResultsPresenter'
import interventionFactory from '../../../testutils/factories/intervention'
import InterventionsFilter from './interventionsFilter'
import pccRegionFactory from '../../../testutils/factories/pccRegion'

describe(SearchResultsPresenter, () => {
  describe('results', () => {
    it('contains as many items as there are interventions', () => {
      const presenter = new SearchResultsPresenter(interventionFactory.buildList(3), new InterventionsFilter(), [])

      expect(presenter.results.length).toBe(3)
    })
  })

  describe('text', () => {
    describe('results', () => {
      describe('with no results', () => {
        it('is correctly pluralised', () => {
          const presenter = new SearchResultsPresenter([], new InterventionsFilter(), [])

          expect(presenter.text.results).toEqual({ count: '0', countSuffix: 'results found.' })
        })
      })

      describe('with 1 result', () => {
        it('is correctly pluralised', () => {
          const presenter = new SearchResultsPresenter(interventionFactory.buildList(1), new InterventionsFilter(), [])

          expect(presenter.text.results).toEqual({ count: '1', countSuffix: 'result found.' })
        })
      })

      describe('with > 1 result', () => {
        it('is correctly pluralised', () => {
          const presenter = new SearchResultsPresenter(interventionFactory.buildList(2), new InterventionsFilter(), [])

          expect(presenter.text.results).toEqual({ count: '2', countSuffix: 'results found.' })
        })
      })
    })
  })

  describe('pccRegionFilters', () => {
    const lancashire = pccRegionFactory.build({ name: 'Lancashire' })
    const norfolk = pccRegionFactory.build({ name: 'Norfolk' })
    const cheshire = pccRegionFactory.build({ name: 'Cheshire' })

    const pccRegions = [lancashire, norfolk, cheshire]

    it('has the correct name and value in alphabetical order', () => {
      const presenter = new SearchResultsPresenter([], new InterventionsFilter(), pccRegions)

      expect(presenter.pccRegionFilters).toMatchObject([
        { value: cheshire.id, text: 'Cheshire' },
        { value: lancashire.id, text: 'Lancashire' },
        { value: norfolk.id, text: 'Norfolk' },
      ])
    })

    describe('checked', () => {
      describe('when filter doesn’t specify PCC region IDs', () => {
        it('is false for all regions', () => {
          const presenter = new SearchResultsPresenter([], new InterventionsFilter(), pccRegions)

          expect(presenter.pccRegionFilters).toMatchObject([{ checked: false }, { checked: false }, { checked: false }])
        })
      })

      describe('when filter specifies PCC region IDs', () => {
        it('returns true for a region listed in the filter and false for a region not listed in the filter', () => {
          const filter = new InterventionsFilter()
          filter.pccRegionIds = [cheshire.id]
          const presenter = new SearchResultsPresenter([], filter, pccRegions)

          expect(presenter.pccRegionFilters).toMatchObject([{ checked: true }, { checked: false }, { checked: false }])
        })
      })
    })
  })

  describe('genderFilters', () => {
    it('has the correct name and value', () => {
      const presenter = new SearchResultsPresenter([], new InterventionsFilter(), [])

      expect(presenter.genderFilters).toMatchObject([
        { value: 'male', text: 'Male' },
        { value: 'female', text: 'Female' },
      ])
    })

    describe('checked', () => {
      describe('when filter doesn’t specify gender', () => {
        it('is false for all values', () => {
          const presenter = new SearchResultsPresenter([], new InterventionsFilter(), [])

          expect(presenter.genderFilters).toMatchObject([{ checked: false }, { checked: false }])
        })
      })

      describe('when filter specifies male', () => {
        it('is true for male', () => {
          const filter = new InterventionsFilter()
          filter.gender = ['male']
          const presenter = new SearchResultsPresenter([], filter, [])

          expect(presenter.genderFilters[0]).toMatchObject({ checked: true })
        })
      })

      describe('when filter specifies female', () => {
        it('is true for female', () => {
          const filter = new InterventionsFilter()
          filter.gender = ['female']
          const presenter = new SearchResultsPresenter([], filter, [])

          expect(presenter.genderFilters[1]).toMatchObject({ checked: true })
        })
      })
    })
  })

  describe('ageFilters', () => {
    it('has the correct name and value', () => {
      const presenter = new SearchResultsPresenter([], new InterventionsFilter(), [])

      expect(presenter.ageFilters).toMatchObject([{ value: '18-to-25-only', text: 'Only for ages 18 to 25' }])
    })

    describe('checked', () => {
      describe('when filter doesn’t specify age', () => {
        it('is false for all values', () => {
          const presenter = new SearchResultsPresenter([], new InterventionsFilter(), [])

          expect(presenter.ageFilters).toMatchObject([{ checked: false }])
        })
      })

      describe('when filter specifies 18 to 25 only', () => {
        it('is true for 18 to 25 only', () => {
          const filter = new InterventionsFilter()
          filter.age = ['18-to-25-only']
          const presenter = new SearchResultsPresenter([], filter, [])

          expect(presenter.ageFilters).toMatchObject([{ checked: true }])
        })
      })
    })
  })
})
