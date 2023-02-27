import RoshPanelPresenter from './roshPanelPresenter'
import riskSummary from '../../../testutils/factories/riskSummary'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'

interface RiskInCommunity {
  [riskLevel: string]: string[]
}

describe(RoshPanelPresenter, () => {
  describe('riskSummaryNotFound', () => {
    it('is true if riskSummary is null', () => {
      const presenter = new RoshPanelPresenter(null)
      expect(presenter.riskSummaryNotFound).toEqual(true)
    })

    it('is false if riskSummary is not null', () => {
      const presenter = new RoshPanelPresenter(riskSummary.build())
      expect(presenter.riskSummaryNotFound).toEqual(false)
    })
  })

  describe('riskInformationAvailable', () => {
    it('is true if riskSummary is not null', () => {
      const presenter = new RoshPanelPresenter(riskSummary.build())
      expect(presenter.riskInformationAvailable).toEqual(true)
    })

    it('is false if riskSummary is null', () => {
      const presenter = new RoshPanelPresenter(null)
      expect(presenter.riskInformationAvailable).toEqual(false)
    })
  })

  describe('roshAnalysisRows', () => {
    it('returns empty list if there is no risk summary', () => {
      const presenter = new RoshPanelPresenter(null)
      expect(presenter.roshAnalysisRows).toEqual([])
    })

    it('returns rows for each risk group in the correct order', () => {
      const presenter = new RoshPanelPresenter(riskSummary.build())
      expect(presenter.roshAnalysisRows).toEqual([
        { riskTo: 'Children', riskScore: 'HIGH' },
        { riskTo: 'Public', riskScore: 'LOW' },
        { riskTo: 'Known adult', riskScore: 'HIGH' },
        { riskTo: 'Staff', riskScore: 'VERY_HIGH' },
      ])
    })
  })

  describe('lastUpdated', () => {
    describe('when the risk summary has an "assessed on" date', () => {
      it('shortens the "assessed on date"', () => {
        const presenter = new RoshPanelPresenter(riskSummary.build({ assessedOn: '2021-09-21T16:03:16.943Z' }))

        expect(presenter.lastUpdated).toEqual('Last updated: 21 Sept 2021')
      })
    })

    describe('when the risk summary has a blank "assessed on" date', () => {
      it('displays a "not found" message', () => {
        const summary = riskSummary.build()
        summary.assessedOn = undefined
        const presenter = new RoshPanelPresenter(summary)

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
            LOW: ['public'],
            HIGH: ['children', 'known adult'],
            VERY_HIGH: ['staff'],
          },
        ],
        [
          'HIGH',
          {
            LOW: ['public'],
            HIGH: ['children', 'known adult'],
          },
        ],
        [
          'MEDIUM',
          {
            LOW: ['public'],
            MEDIUM: ['children', 'known adult'],
          },
        ],
        [
          'LOW',
          {
            LOW: ['public'],
          },
        ],
      ]

      describe.each(riskSummaries)(
        `when the highest score in the Rosh table is %s`,
        (riskInCommunityString, riskInCommunity) => {
          it(`returns ${riskInCommunityString}`, () => {
            const riskRosh = createRiskSummary(riskInCommunity)

            const presenter = new RoshPanelPresenter(riskRosh)

            expect(presenter.formattedOverallRoshScore).toEqual(riskInCommunityString.replace('_', ' '))
            expect(presenter.overallRoshStyle).toEqual(
              `rosh-analysis-table--${riskInCommunityString.replace('_', '-').toLowerCase()}`
            )
          })
        }
      )
    })

    describe('when the highest risk summary is something unexpected', () => {
      it(`returns UNDEFINED`, () => {
        const riskRosh = createRiskSummary({
          UNEXPECTED: ['public'],
        })

        const presenter = new RoshPanelPresenter(riskRosh)

        expect(presenter.formattedOverallRoshScore).toEqual('UNDEFINED')
      })
    })
  })
})
