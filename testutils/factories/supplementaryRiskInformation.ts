import { Factory } from 'fishery'
import { SupplementaryRiskInformation } from '../../server/models/assessRisksAndNeeds/supplementaryRiskInformation'

export default Factory.define<SupplementaryRiskInformation>(() => ({
  riskSummaryComments: 'Some risk information about the user',
  redactedRisk: {
    riskWho: 'some information for who is at risk',
    riskWhen: 'some information for when is the risk',
    riskNature: 'some information on the nature of risk',
    concernsSelfHarm: 'some concerns for self harm',
    concernsSuicide: 'some concerns for suicide',
    concernsHostel: 'some concerns for hostel',
    concernsVulnerability: 'some concerns for vulnerability',
  },
}))
