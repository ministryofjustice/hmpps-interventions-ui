import { Factory } from 'fishery'
import RiskSummary from '../../server/models/assessRisksAndNeeds/riskSummary'

export default Factory.define<RiskSummary>(() => ({
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
    riskInCommunity: {
      LOW: ['Public'],
      HIGH: ['Known adult', 'Children'],
      VERY_HIGH: ['Staff'],
    },
    natureOfRisk: 'physically aggressive',
    riskImminence: 'can happen at the drop of a hat',
  },
  assessedOn: '2021-09-20T09:31:45.062Z',
}))
