import { Factory } from 'fishery'
import RiskSummary from '../../server/models/assessRisksAndNeeds/riskSummary'

export default Factory.define<RiskSummary>(() => ({
  riskInCommunity: {
    LOW: ['prisoners'],
    HIGH: ['children', 'known adult'],
    VERY_HIGH: ['staff'],
  },
}))
