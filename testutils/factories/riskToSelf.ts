import { Factory } from 'fishery'
import RiskToSelf from '../../server/models/assessRisksAndNeeds/riskToSelf'

export default Factory.define<RiskToSelf>(() => ({
  suicide: {
    risk: 'YES',
    previous: null,
    current: 'Manic episodes are common.',
  },
  hostelSetting: {
    risk: 'DK',
    previous: null,
    current: null,
  },
  vulnerability: {
    risk: 'NO',
    previous: 'something',
    current: null,
  },
}))
