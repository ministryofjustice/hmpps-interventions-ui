import { Factory } from 'fishery'
import RiskSummary from '../../server/models/assessRisksAndNeeds/riskSummary'

export default Factory.define<RiskSummary>(() => ({
  riskInCommunity: {
    LOW: ['prisoners'],
    HIGH: ['children', 'known adult'],
  },
  natureOfRisk: 'physically aggressive',
  riskImminence: 'can happen at the drop of a hat',
}))
