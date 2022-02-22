import ActionPlanUtils from './actionPlanUtils'
import Factory from '../../testutils/factories/approvedActionPlanSummary'

describe(ActionPlanUtils, () => {
  describe('sortApprovedActionPlanSummaries', () => {
    it('returns empty list for an empty list', () => {
      const sorted = ActionPlanUtils.sortApprovedActionPlanSummaries([])
      expect(sorted).toEqual([])
    })

    it('returns a list sorted by approval date', () => {
      const sorted = ActionPlanUtils.sortApprovedActionPlanSummaries([
        Factory.build({ approvedAt: '2021-01-01T12:12:12+00:00' }),
        Factory.build({ approvedAt: '2021-01-02T14:00:00+00:00' }), // newest
        Factory.build({ approvedAt: '2021-01-02T12:12:12+00:00' }),
        Factory.build({ approvedAt: '2020-01-02T12:12:12+00:00' }), // oldest
      ])
      expect(sorted.map(it => it.approvedAt)).toEqual([
        '2021-01-02T14:00:00+00:00',
        '2021-01-02T12:12:12+00:00',
        '2021-01-01T12:12:12+00:00',
        '2020-01-02T12:12:12+00:00',
      ])
    })
  })

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
