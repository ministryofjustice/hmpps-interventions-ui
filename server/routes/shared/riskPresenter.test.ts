import RiskPresenter from './riskPresenter'
import riskSummary from '../../../testutils/factories/riskSummary'

describe(RiskPresenter, () => {
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

  describe('text', () => {
    it('contains additional risk information', () => {
      const presenter = new RiskPresenter(riskSummary.build())
      expect(presenter.text).toMatchObject({
        natureOfRisk: 'physically aggressive',
        riskImminence: 'can happen at the drop of a hat',
        whoIsAtRisk: undefined,
      })
    })
  })
})
