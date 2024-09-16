import EditOasysRiskInformationView from './editOasysRiskInformationView'
import EditOasysRiskInformationPresenter from './editOasysRiskInformationPresenter'
import { SentOasysRiskInformation } from '../../../../../models/sentOasysRiskInformation'
import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'
import { TextareaArgs } from '../../../../../utils/govukFrontendTypes'

describe('EditOasysRiskInformationView', () => {
  describe('Risk Information', () => {
    describe('when superseded by sent record information', () => {
      const riskSummary = riskSummaryFactory.build({
        riskToSelf: {
          suicide: { currentConcernsText: 'OAsysSuicide', current: 'YES' },
          selfHarm: { currentConcernsText: 'OAsysSelfHarm', current: 'YES' },
          hostelSetting: { currentConcernsText: 'OAsysHostelSetting', current: 'YES' },
          vulnerability: { currentConcernsText: 'OAsysVulnerability', current: 'YES' },
        },
        summary: {
          whoIsAtRisk: 'OAsysWhoIsAtRisk',
          natureOfRisk: 'OAsysNatureOfRisk',
          riskImminence: 'OAsysRiskImminence',
        },
      })
      it('should show OAsys version for each textbox field when sent record does not exist', () => {
        const editOasysRiskInformationPresenter = new EditOasysRiskInformationPresenter(
          riskSummary,
          null,
          null,
          'label'
        )
        const fields = new EditOasysRiskInformationView(editOasysRiskInformationPresenter).renderArgs[1]
        expect((fields.whoIsAtRiskTextareaArgs as TextareaArgs).value).toEqual('OAsysWhoIsAtRisk')
        expect((fields.natureOfRiskTextareaArgs as TextareaArgs).value).toEqual('OAsysNatureOfRisk')
        expect((fields.riskImminenceTextareaArgs as TextareaArgs).value).toEqual('OAsysRiskImminence')
        expect((fields.riskToSelfSuicideTextareaArgs as TextareaArgs).value).toEqual('OAsysSuicide')
        expect((fields.riskToSelfSelfHarmTextareaArgs as TextareaArgs).value).toEqual('OAsysSelfHarm')
        expect((fields.riskToSelfHostelSettingTextareaArgs as TextareaArgs).value).toEqual('OAsysHostelSetting')
        expect((fields.riskToSelfVulnerabilityTextareaArgs as TextareaArgs).value).toEqual('OAsysVulnerability')
        expect((fields.additionalInformationTextareaArgs as TextareaArgs).value).toEqual('')
      })
      it('should show sent version for each textbox field when sent record exists', () => {
        const sentOasysRiskInformation: SentOasysRiskInformation = {
          riskSummaryWhoIsAtRisk: 'sentWhoIsAtRisk',
          riskSummaryNatureOfRisk: 'sentNatureOfRisk',
          riskSummaryRiskImminence: 'sentRiskImminence',
          riskToSelfSuicide: 'sentSuicide',
          riskToSelfSelfHarm: 'sentSelfHarm',
          riskToSelfHostelSetting: 'sentHostelSetting',
          riskToSelfVulnerability: 'sentVulnerability',
          additionalInformation: 'sentAdditionalInformation',
        }
        const editOasysRiskInformationPresenter = new EditOasysRiskInformationPresenter(
          riskSummary,
          sentOasysRiskInformation,
          null,
          'label'
        )
        const fields = new EditOasysRiskInformationView(editOasysRiskInformationPresenter).renderArgs[1]
        expect((fields.whoIsAtRiskTextareaArgs as TextareaArgs).value).toEqual('sentWhoIsAtRisk')
        expect((fields.natureOfRiskTextareaArgs as TextareaArgs).value).toEqual('sentNatureOfRisk')
        expect((fields.riskImminenceTextareaArgs as TextareaArgs).value).toEqual('sentRiskImminence')
        expect((fields.riskToSelfSuicideTextareaArgs as TextareaArgs).value).toEqual('sentSuicide')
        expect((fields.riskToSelfSelfHarmTextareaArgs as TextareaArgs).value).toEqual('sentSelfHarm')
        expect((fields.riskToSelfHostelSettingTextareaArgs as TextareaArgs).value).toEqual('sentHostelSetting')
        expect((fields.riskToSelfVulnerabilityTextareaArgs as TextareaArgs).value).toEqual('sentVulnerability')
        expect((fields.additionalInformationTextareaArgs as TextareaArgs).value).toEqual('sentAdditionalInformation')
      })
    })
  })
})
