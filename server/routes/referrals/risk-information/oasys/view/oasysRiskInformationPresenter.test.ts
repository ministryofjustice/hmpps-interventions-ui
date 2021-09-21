import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import draftReferralFactory from '../../../../../../testutils/factories/draftReferral'
import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'

describe('OasysRiskInformationPresenter', () => {
  describe('latestAssessment', () => {
    it('returns the correctly formatted date', () => {
      const referral = draftReferralFactory.build()
      const riskSummary = riskSummaryFactory.build({ assessedOn: '2021-09-20T09:31:45.062Z' })
      const presenter = new OasysRiskInformationPresenter(referral, riskSummary)

      expect(presenter.latestAssessment).toEqual('20 September 2021')
    })
  })
})
