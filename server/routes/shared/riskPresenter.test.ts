import RiskPresenter from './riskPresenter'
import riskSummary from '../../../testutils/factories/riskSummary'
import config from '../../config'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'

interface RiskInCommunity {
  [riskLevel: string]: string[]
}

describe(RiskPresenter, () => {
  describe('riskSummaryNotFound', () => {
    it('is true if riskSummary is null', () => {
      const presenter = new RiskPresenter(null)
      expect(presenter.riskSummaryNotFound).toEqual(true)
    })

    it('is false if riskSummary is not null', () => {
      const presenter = new RiskPresenter(riskSummary.build())
      expect(presenter.riskSummaryNotFound).toEqual(false)
    })
  })

  describe('riskInformationAvailable', () => {
    it('is true if riskSummary is enabled in config and riskSummary is not null', () => {
      try {
        config.apis.assessRisksAndNeedsApi.riskSummaryEnabled = true
        const presenter = new RiskPresenter(riskSummary.build())
        expect(presenter.riskInformationAvailable).toEqual(true)
      } finally {
        config.apis.assessRisksAndNeedsApi.riskSummaryEnabled = false
      }
    })

    it('is false if riskSummary is disabled in config', () => {
      const presenter = new RiskPresenter(riskSummary.build())
      expect(presenter.riskInformationAvailable).toEqual(false)
    })

    it('is false if riskSummary is null', () => {
      try {
        config.apis.assessRisksAndNeedsApi.riskSummaryEnabled = true
        const presenter = new RiskPresenter(null)
        expect(presenter.riskInformationAvailable).toEqual(false)
      } finally {
        config.apis.assessRisksAndNeedsApi.riskSummaryEnabled = false
      }
    })
  })

  describe('roshAnalysisRows', () => {
    it('returns empty list if there is no risk summary', () => {
      const presenter = new RiskPresenter(null)
      expect(presenter.roshAnalysisRows).toEqual([])
    })

    it('returns rows for each risk group', () => {
      const presenter = new RiskPresenter(riskSummary.build())
      expect(presenter.roshAnalysisRows).toEqual([
        { riskTo: 'prisoners', riskScore: 'LOW' },
        { riskTo: 'children', riskScore: 'HIGH' },
        { riskTo: 'known adult', riskScore: 'HIGH' },
        { riskTo: 'staff', riskScore: 'VERY_HIGH' },
      ])
    })
  })

  describe('lastUpdated', () => {
    describe('when the risk summary has an "assessed on" date', () => {
      it('shortens the "assessed on date"', () => {
        const presenter = new RiskPresenter(riskSummary.build({ assessedOn: '2021-09-21T16:03:16.943Z' }))

        expect(presenter.lastUpdated).toEqual('Last updated: 21 Sep 2021')
      })
    })

    describe('when the risk summary has a blank "assessed on" date', () => {
      it('displays a "not found" message', () => {
        const summary = riskSummary.build()
        summary.assessedOn = undefined
        const presenter = new RiskPresenter(summary)

        expect(presenter.lastUpdated).toEqual('Last updated: assessment date not found')
      })
    })
  })

  describe('overallRoshScore', () => {
    const createRiskSummary = (riskInCommunity: RiskInCommunity): RiskSummary => {
      return {
        riskToSelf: {
          suicide: {
            risk: 'YES',
            current: 'YES',
            currentConcernsText: 'Manic episodes are common.',
          },
          hostelSetting: {
            risk: 'DK',
            current: null,
            currentConcernsText: null,
          },
          vulnerability: {
            risk: 'NO',
            current: null,
            currentConcernsText: null,
          },
        },
        summary: {
          riskInCommunity,
          natureOfRisk: 'physically aggressive',
          riskImminence: 'can happen at the drop of a hat',
        },
        assessedOn: '2021-09-20T09:31:45.062Z',
      }
    }

    describe('when the risk summary exists', () => {
      const riskSummaries: [string, RiskInCommunity][] = [
        [
          'VERY_HIGH',
          {
            LOW: ['prisoners'],
            HIGH: ['children', 'known adult'],
            VERY_HIGH: ['staff'],
          },
        ],
        [
          'HIGH',
          {
            LOW: ['prisoners'],
            HIGH: ['children', 'known adult'],
          },
        ],
        [
          'MEDIUM',
          {
            LOW: ['prisoners'],
            MEDIUM: ['children', 'known adult'],
          },
        ],
        [
          'LOW',
          {
            LOW: ['prisoners'],
          },
        ],
      ]

      describe.each(riskSummaries)(
        `when the highest score in the Rosh table is %s`,
        (riskInCommunityString, riskInCommunity) => {
          it(`returns ${riskInCommunityString}`, () => {
            const riskRosh = createRiskSummary(riskInCommunity)

            const presenter = new RiskPresenter(riskRosh)

            expect(presenter.formattedOverallRoshScore).toEqual(riskInCommunityString.replace('_', ' '))
            expect(presenter.overallRoshStyle).toEqual(
              `rosh-analysis-table--${riskInCommunityString.replace('_', '-').toLowerCase()}`
            )
          })
        }
      )
    })
  })
})
