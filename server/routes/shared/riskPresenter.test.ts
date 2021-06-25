import RiskPresenter from './riskPresenter'
import riskSummary from '../../../testutils/factories/riskSummary'

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
})
