import ActionPlanUtils from './actionPlanUtils'
import Factory from '../../testutils/factories/approvedActionPlanSummary'

describe(ActionPlanUtils, () => {
  describe('getLatestApprovedActionPlanSummary', () => {
    it('returns null for an empty list', () => {
      const latest = ActionPlanUtils.getLatestApprovedActionPlanSummary([])
      expect(latest).toBeNull()
    })

    it('returns the latest action plan summary', () => {
      const latest = ActionPlanUtils.getLatestApprovedActionPlanSummary([
        Factory.build({ approvedAt: '2021-01-01T12:12:12+00:00' }),
        Factory.build({ approvedAt: '2021-01-02T14:00:00+00:00' }), // newest
        Factory.build({ approvedAt: '2021-01-02T12:12:12+00:00' }),
        Factory.build({ approvedAt: '2020-01-02T12:12:12+00:00' }), // oldest
      ])
      expect(latest?.approvedAt).toEqual('2021-01-02T14:00:00+00:00')
    })
  })
})
