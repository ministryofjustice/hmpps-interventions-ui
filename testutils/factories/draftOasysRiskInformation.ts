import { Factory } from 'fishery'
import { DraftOasysRiskInformation } from '../../server/models/draftOasysRiskInformation'

class DraftOasysRiskInformationFactory extends Factory<DraftOasysRiskInformation> {}

export default DraftOasysRiskInformationFactory.define(() => ({
  riskSummaryWhoIsAtRisk: 'Risk to staff.',
  riskSummaryNatureOfRisk: 'Physically aggressive',
  riskSummaryRiskImminence: 'Can happen at the drop of a hat',
  riskToSelfSuicide: 'Manic episodes are common',
  riskToSelfSelfHarm: null,
  riskToSelfHostelSetting: null,
  riskToSelfVulnerability: null,
  additionalInformation: 'No more comments.',
}))
