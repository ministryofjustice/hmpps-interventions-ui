import { DeepPartial } from 'fishery'
import interventionFactory from '../../../testutils/factories/intervention'
import eligibilityFactory from '../../../testutils/factories/eligibility'
import serviceProviderFactory from '../../../testutils/factories/serviceProvider'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import Intervention from '../../models/intervention'
import InterventionDetailsPresenter from './interventionDetailsPresenter'
import TestUtils from '../../../testutils/testUtils'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import pccRegion from '../../../testutils/factories/pccRegion'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'

describe(InterventionDetailsPresenter, () => {
  const loggedInUser = loggedInUserFactory.probationUser().build()
  describe('title', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        title: 'Accommodation',
      }),
      loggedInUser
    )
    it('returns the intervention title', () => {
      expect(presenter.title).toEqual('Accommodation')
    })
  })

  describe('hrefReferralStart', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        id: '65b5cc27-0b87-4f44-8a35-bb08fc64e90e',
      }),
      loggedInUser
    )
    it('returns the link to make a referral', () => {
      expect(presenter.hrefReferralStart).toEqual('/intervention/65b5cc27-0b87-4f44-8a35-bb08fc64e90e/refer')
    })
  })

  describe('hrefInterventionDetails', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        id: '65b5cc27-0b87-4f44-8a35-bb08fc64e90e',
      }),
      loggedInUser
    )
    it('returns the link to the intervention', () => {
      expect(presenter.hrefInterventionDetails).toEqual(
        '/find-interventions/intervention/65b5cc27-0b87-4f44-8a35-bb08fc64e90e'
      )
    })
  })

  describe('description', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        description: 'Some information about the intervention',
      }),
      loggedInUser
    )
    it('returns the intervention description', () => {
      expect(presenter.description).toEqual('Some information about the intervention')
    })
  })

  describe('truncatedDescription', () => {
    it('does not modify short single line descriptions', () => {
      const presenter = new InterventionDetailsPresenter(
        interventionFactory.build({
          description: 'Some information about the intervention',
        }),
        loggedInUser
      )
      expect(presenter.truncatedDescription).toEqual('Some information about the intervention')
    })

    it('trims down multiline descriptions to the first line', () => {
      const presenter = new InterventionDetailsPresenter(
        interventionFactory.build({
          description: `Some information about the intervention
that is longer than one line
and even longer than
three lines.`,
        }),
        loggedInUser
      )
      expect(presenter.truncatedDescription).toEqual('Some information about the intervention')
    })

    it('trims down long single line descriptions to 500 characters', () => {
      const presenter = new InterventionDetailsPresenter(
        interventionFactory.build({
          description: new Array(1000).join('x'),
        }),
        loggedInUser
      )
      expect(presenter.truncatedDescription).toEqual(`${new Array(501).join('x')}...`)
    })

    it('trims down long multiline descriptions to 500 characters', () => {
      const presenter = new InterventionDetailsPresenter(
        interventionFactory.build({
          description: `${new Array(1000).join('x')}\n${new Array(1000).join('z')}`,
        }),
        loggedInUser
      )
      expect(presenter.truncatedDescription).toEqual(`${new Array(501).join('x')}...`)
    })
  })

  describe('tabs', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        serviceProvider: serviceProviderFactory.build({ name: 'Harmony Living' }),
      }),
      loggedInUser
    )

    it('returns an array of summary lists, each with an id and title', () => {
      expect(presenter.tabs).toEqual([
        {
          id: 'service-provider-tab',
          title: 'Service Provider',
          items: [
            {
              key: 'Name',
              lines: ['Harmony Living'],
            },
          ],
        },
      ])
    })
  })

  describe('summary', () => {
    function summaryForParams(params: DeepPartial<Intervention>): SummaryListItem[] {
      return new InterventionDetailsPresenter(interventionFactory.build(params), loggedInUser).summary
    }

    function linesForKey(key: string, params: DeepPartial<Intervention>): string[] | null {
      return TestUtils.linesForKey(key, () => summaryForParams(params))
    }

    describe('Type', () => {
      it('is “Commissioned Rehabilitative Service”', () => {
        expect(linesForKey('Type', {})).toEqual(['Commissioned Rehabilitative Service'])
      })
    })

    describe('Region', () => {
      describe('when NPS Region is present on the intervention', () => {
        it('is the NPS region name', () => {
          expect(
            linesForKey('Region', {
              npsRegion: { id: 'A', name: 'North East' },
            })
          ).toEqual(['North East'])
        })
      })

      describe('when NPS Region is not present on the intervention', () => {
        it('is not present in the summary', () => {
          expect(
            linesForKey('Random', {
              npsRegion: null,
            })
          ).toEqual(null)
        })
      })
    })

    describe('Location', () => {
      it('is a comma-separated list of PCC regions', () => {
        expect(
          linesForKey('Location', {
            pccRegions: [pccRegion.build({ name: 'Region 1' }), pccRegion.build({ name: 'Region 2' })],
          })
        ).toEqual(['Region 1, Region 2'])
      })
    })

    describe('Service type', () => {
      describe('for a single-service intervention', () => {
        it('is the service category name', () => {
          expect(
            linesForKey('Service category', {
              serviceCategories: [serviceCategoryFactory.build({ name: 'accommodation' })],
            })
          ).toEqual(['Accommodation'])
        })
      })

      describe('for a cohort intervention', () => {
        it('has a pluralised key, and is a list of service category names', () => {
          const summary = summaryForParams({
            serviceCategories: [
              serviceCategoryFactory.build({ name: 'accommodation' }),
              serviceCategoryFactory.build({ name: 'emotional wellbeing' }),
            ],
          })
          const item = summary.find(anItem => anItem.key === 'Service categories')
          expect(item).toMatchObject({ lines: ['Accommodation', 'Emotional wellbeing'], listStyle: ListStyle.bulleted })
        })
        it('sorts service categories alphabetically', () => {
          const summary = summaryForParams({
            serviceCategories: [
              serviceCategoryFactory.build({ name: 'social inclusion' }),
              serviceCategoryFactory.build({ name: 'emotional wellbeing' }),
              serviceCategoryFactory.build({ name: 'accommodation' }),
              serviceCategoryFactory.build({ name: 'family and significant others' }),
              serviceCategoryFactory.build({ name: 'lifestyle and associates' }),
            ],
          })
          const item = summary.find(anItem => anItem.key === 'Service categories')
          expect(item).toMatchObject({
            lines: [
              'Accommodation',
              'Emotional wellbeing',
              'Family and significant others',
              'Lifestyle and associates',
              'Social inclusion',
            ],
            listStyle: ListStyle.bulleted,
          })
        })
      })
    })

    describe('Provider', () => {
      it('is the service provider’s name', () => {
        expect(
          linesForKey('Provider', {
            serviceProvider: { name: 'Harmony Living' },
          })
        ).toEqual(['Harmony Living'])
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

    describe('Gender', () => {
      describe('with an intervention that’s for any adult male', () => {
        it('is “Male”', () => {
          expect(
            linesForKey('Gender', {
              eligibility: eligibilityFactory.anyAdultMale().build(),
            })
          ).toEqual(['Male'])
        })
      })

      describe('with an intervention that’s for any adult female', () => {
        it('is “Female”', () => {
          expect(
            linesForKey('Gender', {
              eligibility: eligibilityFactory.anyAdultFemale().build(),
            })
          ).toEqual(['Female'])
        })
      })

      describe('with an intervention that’s for all adults', () => {
        it('is “Male and female”', () => {
          expect(
            linesForKey('Gender', {
              eligibility: eligibilityFactory.allAdults().build(),
            })
          ).toEqual(['Male and female'])
        })
      })
    })
  })
})
