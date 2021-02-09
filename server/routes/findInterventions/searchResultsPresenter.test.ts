import { DeepPartial } from 'fishery'
import SearchResultsPresenter from './searchResultsPresenter'
import interventionFactory from '../../../testutils/factories/intervention'
import eligibilityFactory from '../../../testutils/factories/eligibility'
import { Intervention } from '../../services/interventionsService'

describe(SearchResultsPresenter, () => {
  describe('results', () => {
    it('contains as many items as there are interventions', () => {
      const presenter = new SearchResultsPresenter(interventionFactory.buildList(3))

      expect(presenter.results.length).toBe(3)
    })

    function linesForKey(key: string, params: DeepPartial<Intervention>): string[] {
      const presenter = new SearchResultsPresenter([interventionFactory.build(params)])
      const item = presenter.results[0].summary.find(anItem => anItem.key === key)
      if (item === undefined) {
        fail(`Didn't find item for key ${key}`)
      }
      return item.lines
    }

    describe('Type', () => {
      it('is “Dynamic Framework”', () => {
        expect(linesForKey('Type', {})).toEqual(['Dynamic Framework'])
      })
    })

    describe('Location', () => {
      it('is a comma-separated list of PCC regions', () => {
        expect(
          linesForKey('Location', {
            pccRegions: [
              { id: '1', name: 'Region 1' },
              { id: '2', name: 'Region 2' },
            ],
          })
        ).toEqual(['Region 1, Region 2'])
      })
    })

    describe('Criminogenic needs', () => {
      it('is the service category name', () => {
        expect(
          linesForKey('Criminogenic needs', {
            serviceCategory: { name: 'accommodation' },
          })
        ).toEqual(['Accommodation'])
      })
    })

    describe('Provider', () => {
      it('is the service provider’s name', () => {
        expect(
          linesForKey('Criminogenic needs', {
            serviceCategory: { name: 'accommodation' },
          })
        ).toEqual(['Accommodation'])
      })
    })

    describe('Age group', () => {
      describe('with an intervention that’s for all adults', () => {
        it('is “18+”', () => {
          expect(
            linesForKey('Age group', {
              eligibility: eligibilityFactory.allAdults().build(),
            })
          ).toEqual(['18+'])
        })
      })

      describe('with an intervention that’s only for young people', () => {
        it('is “18–25”', () => {
          expect(
            linesForKey('Age group', {
              eligibility: eligibilityFactory.youngAdultMales().build(),
            })
          ).toEqual(['18–25'])
        })
      })
    })

    describe('Sex', () => {
      describe('with an intervention that’s for any adult male', () => {
        it('is “Male”', () => {
          expect(
            linesForKey('Sex', {
              eligibility: eligibilityFactory.anyAdultMale().build(),
            })
          ).toEqual(['Male'])
        })
      })

      describe('with an intervention that’s for any adult female', () => {
        it('is “Female”', () => {
          expect(
            linesForKey('Sex', {
              eligibility: eligibilityFactory.anyAdultFemale().build(),
            })
          ).toEqual(['Female'])
        })
      })

      describe('with an intervention that’s for all adults', () => {
        it('is “Male and female”', () => {
          expect(
            linesForKey('Sex', {
              eligibility: eligibilityFactory.allAdults().build(),
            })
          ).toEqual(['Male and female'])
        })
      })
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
