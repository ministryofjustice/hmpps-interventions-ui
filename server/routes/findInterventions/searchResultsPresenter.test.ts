import SearchResultsPresenter from './searchResultsPresenter'
import interventionFactory from '../../../testutils/factories/intervention'

describe(SearchResultsPresenter, () => {
  describe('results', () => {
    it('contains as many items as there are interventions', () => {
      const presenter = new SearchResultsPresenter(interventionFactory.buildList(3))

      expect(presenter.results.length).toBe(3)
    })
  })

  describe('text', () => {
    describe('results', () => {
      describe('with no results', () => {
        it('is correctly pluralised', () => {
          const presenter = new SearchResultsPresenter([])

          expect(presenter.text.results).toEqual({ count: '0', countSuffix: 'results found.' })
        })
      })

      describe('with 1 result', () => {
        it('is correctly pluralised', () => {
          const presenter = new SearchResultsPresenter(interventionFactory.buildList(1))

          expect(presenter.text.results).toEqual({ count: '1', countSuffix: 'result found.' })
        })
      })

      describe('with > 1 result', () => {
        it('is correctly pluralised', () => {
          const presenter = new SearchResultsPresenter(interventionFactory.buildList(2))

          expect(presenter.text.results).toEqual({ count: '2', countSuffix: 'results found.' })
        })
      })
    })
  })
})
