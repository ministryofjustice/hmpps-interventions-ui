import { DeepPartial } from 'fishery'
import interventionFactory from '../../../testutils/factories/intervention'
import eligibilityFactory from '../../../testutils/factories/eligibility'
import serviceProviderFactory from '../../../testutils/factories/serviceProvider'
import { Intervention } from '../../services/interventionsService'
import InterventionDetailsPresenter from './interventionDetailsPresenter'
import TestUtils from '../../../testutils/testUtils'

describe(InterventionDetailsPresenter, () => {
  describe('title', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        title: 'Accommodation',
      })
    )
    it('returns the intervention title', () => {
      expect(presenter.title).toEqual('Accommodation')
    })
  })

  describe('hrefReferralStart', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        id: '65b5cc27-0b87-4f44-8a35-bb08fc64e90e',
      })
    )
    it('returns the link to make a referral', () => {
      expect(presenter.hrefReferralStart).toEqual('/intervention/65b5cc27-0b87-4f44-8a35-bb08fc64e90e/refer')
    })
  })

  describe('hrefInterventionDetails', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        id: '65b5cc27-0b87-4f44-8a35-bb08fc64e90e',
      })
    )
    it('returns the link to the intervention', () => {
      expect(presenter.hrefInterventionDetails).toEqual(
        '/find-interventions/intervention/65b5cc27-0b87-4f44-8a35-bb08fc64e90e'
      )
    })
  })

  describe('body', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        description: 'Some information about the intervention',
      })
    )
    it('returns the intervention description', () => {
      expect(presenter.body).toEqual('Some information about the intervention')
    })
  })

  describe('tabs', () => {
    const presenter = new InterventionDetailsPresenter(
      interventionFactory.build({
        serviceProvider: serviceProviderFactory.build({ name: 'Harmony Living' }),
      })
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
              isList: false,
            },
          ],
        },
      ])
    })
  })

  describe('summary', () => {
    function linesForKey(key: string, params: DeepPartial<Intervention>): string[] | null {
      return TestUtils.linesForKey(
        key,
        () => new InterventionDetailsPresenter(interventionFactory.build(params)).summary
      )
    }

    describe('Type', () => {
      it('is “Dynamic Framework”', () => {
        expect(linesForKey('Type', {})).toEqual(['Dynamic Framework'])
      })
    })

    describe('Region', () => {
      it('is the NPS region name', () => {
        expect(
          linesForKey('Region', {
            npsRegion: { id: 'A', name: 'North East' },
          })
        ).toEqual(['North East'])
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
