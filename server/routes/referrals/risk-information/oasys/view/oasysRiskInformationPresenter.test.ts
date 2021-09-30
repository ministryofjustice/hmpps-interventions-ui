import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'
import supplementaryRiskInformationFactory from '../../../../../../testutils/factories/supplementaryRiskInformation'

describe('OasysRiskInformationPresenter', () => {
  describe('latestAssessment', () => {
    it('returns the correctly formatted date', () => {
      const riskSummary = riskSummaryFactory.build({ assessedOn: '2021-09-20T09:31:45.062Z' })
      const presenter = new OasysRiskInformationPresenter(supplementaryRiskInformationFactory.build(), riskSummary)

      expect(presenter.latestAssessment).toEqual('20 September 2021')
    })
  })
})
