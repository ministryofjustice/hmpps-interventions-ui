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
      LOW: ['prisoners'],
      HIGH: ['children', 'known adult'],
      VERY_HIGH: ['staff'],
    },
    natureOfRisk: 'physically aggressive',
    riskImminence: 'can happen at the drop of a hat',
  },
}))
