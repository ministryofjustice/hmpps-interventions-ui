import EditOasysRiskInformationView from './editOasysRiskInformationView'
import EditOasysRiskInformationPresenter from './editOasysRiskInformationPresenter'
import { DraftOasysRiskInformation } from '../../../../../models/draftOasysRiskInformation'
import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'
import { TextareaArgs } from '../../../../../utils/govukFrontendTypes'

describe('EditOasysRiskInformationView', () => {
  describe('Risk Information', () => {
    describe('when superseded by draft information', () => {
      const riskSummary = riskSummaryFactory.build({
        riskToSelf: {
          suicide: { currentConcernsText: 'OAsysSuicide' },
          selfHarm: { currentConcernsText: 'OAsysSelfHarm' },
          hostelSetting: { currentConcernsText: 'OAsysHostelSetting' },
          vulnerability: { currentConcernsText: 'OAsysVulnerability' },
        },
        summary: {
          whoIsAtRisk: 'OAsysWhoIsAtRisk',
          natureOfRisk: 'OAsysNatureOfRisk',
          riskImminence: 'OAsysRiskImminence',
        },
      })
      it('should show OAsys version for each textbox field when draft does not exist', () => {
        const editOasysRiskInformationPresenter = new EditOasysRiskInformationPresenter(riskSummary, null)
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
      it('should show draft version for each textbox field when draft exists', () => {
        const draftOasysRiskInformation: DraftOasysRiskInformation = {
          riskSummaryWhoIsAtRisk: 'draftWhoIsAtRisk',
          riskSummaryNatureOfRisk: 'draftNatureOfRisk',
          riskSummaryRiskImminence: 'draftRiskImminence',
          riskToSelfSuicide: 'draftSuicide',
          riskToSelfSelfHarm: 'draftSelfHarm',
          riskToSelfHostelSetting: 'draftHostelSetting',
          riskToSelfVulnerability: 'draftVulnerability',
          additionalInformation: 'draftAdditionalInformation',
        }
        const editOasysRiskInformationPresenter = new EditOasysRiskInformationPresenter(
          riskSummary,
          draftOasysRiskInformation
        )
        const fields = new EditOasysRiskInformationView(editOasysRiskInformationPresenter).renderArgs[1]
        expect((fields.whoIsAtRiskTextareaArgs as TextareaArgs).value).toEqual('draftWhoIsAtRisk')
        expect((fields.natureOfRiskTextareaArgs as TextareaArgs).value).toEqual('draftNatureOfRisk')
        expect((fields.riskImminenceTextareaArgs as TextareaArgs).value).toEqual('draftRiskImminence')
        expect((fields.riskToSelfSuicideTextareaArgs as TextareaArgs).value).toEqual('draftSuicide')
        expect((fields.riskToSelfSelfHarmTextareaArgs as TextareaArgs).value).toEqual('draftSelfHarm')
        expect((fields.riskToSelfHostelSettingTextareaArgs as TextareaArgs).value).toEqual('draftHostelSetting')
        expect((fields.riskToSelfVulnerabilityTextareaArgs as TextareaArgs).value).toEqual('draftVulnerability')
        expect((fields.additionalInformationTextareaArgs as TextareaArgs).value).toEqual('draftAdditionalInformation')
      })
    })
  })
})
