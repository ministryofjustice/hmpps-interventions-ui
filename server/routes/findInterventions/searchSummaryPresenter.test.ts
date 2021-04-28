import InterventionsFilter from './interventionsFilter'
import SearchSummaryPresenter from './searchSummaryPresenter'
import pccRegionFactory from '../../../testutils/factories/pccRegion'
import PCCRegion from '../../models/pccRegion'
import TestUtils from '../../../testutils/testUtils'

describe(SearchSummaryPresenter, () => {
  describe('summary', () => {
    describe('with an empty filter', () => {
      it('returns no summary list items', () => {
        const presenter = new SearchSummaryPresenter(new InterventionsFilter(), [])

        expect(presenter.summary).toEqual([])
      })
    })

    function linesForKey(key: string, args: [InterventionsFilter, PCCRegion[]]): string[] | null {
      return TestUtils.linesForKey(key, () => new SearchSummaryPresenter(...args).summary)
    }

    describe('when filter has PCC regions selected', () => {
      it('describes the filter', () => {
        const pccRegions = [
          pccRegionFactory.build({ name: 'Cheshire' }),
          pccRegionFactory.build({ name: 'Cumbria' }),
          pccRegionFactory.build({ name: 'Lancashire' }),
        ]

        const filter = new InterventionsFilter()
        filter.pccRegionIds = [pccRegions[0].id, pccRegions[1].id]

        expect(linesForKey('In', [filter, pccRegions])).toEqual(['Cheshire, Cumbria'])
      })
    })

    describe('when filter has gender selected', () => {
      it('describes the filter', () => {
        const filter = new InterventionsFilter()
        filter.gender = ['male', 'female']

        expect(linesForKey('For', [filter, []])).toEqual(['Male, Female'])
      })
    })

    describe('when filter has ages selected', () => {
      it('describes the filter', () => {
        const filter = new InterventionsFilter()
        filter.age = ['18-to-25-only']

        expect(linesForKey('Aged', [filter, []])).toEqual(['18 to 25 only'])
      })
    })
  })
})
