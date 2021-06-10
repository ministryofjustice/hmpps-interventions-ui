import { Factory } from 'fishery'
import { SupplementaryRiskInformation } from '../../server/models/assessRisksAndNeeds/supplementaryRiskInformation'

export default Factory.define<SupplementaryRiskInformation>(() => ({
  riskSummaryComments: 'Some risk information about the user',
}))
