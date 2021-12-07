import riskSummaryFactory from '../../../../../testutils/factories/riskSummary'
import supplementaryRiskInformationFactory from '../../../../../testutils/factories/supplementaryRiskInformation'
import { Risk } from '../../../../models/assessRisksAndNeeds/riskSummary'
import ArnRiskSummaryView from './arnRiskSummaryView'

describe('ArnRiskSummaryView', () => {
  describe('supplementaryRiskInformationArgs', () => {
    describe('additionalRiskInformation', () => {
      it('returns no information label if no additional risk information has been provided', () => {
        const riskSummary = riskSummaryFactory.build()
        const view = new ArnRiskSummaryView(
          riskSummary,
          supplementaryRiskInformationFactory.build({
            riskSummaryComments: undefined,
          })
        )
        expect(view.supplementaryRiskInformationArgs.additionalRiskInformation.label).toHaveProperty('text', 'None')
      })
    })

    describe('summary', () => {
      it('returns null text when undefined redactedRisk provided', () => {
        const view = new ArnRiskSummaryView(
          riskSummaryFactory.build(),
          supplementaryRiskInformationFactory.build({ redactedRisk: undefined })
        )
        expect(view.supplementaryRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.text).toBeNull()
      })

      it('returns correct text when supplementary information provided', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
          riskSummaryComments: 'Some risk information about the user',
          redactedRisk: {
            riskWho: 'some information for who is at risk',
            riskWhen: 'some information for when is the risk',
            riskNature: 'some information on the nature of risk',
          },
        })
        const view = new ArnRiskSummaryView(riskSummaryFactory.build(), supplementaryRiskInformation)
        expect(view.supplementaryRiskInformationArgs.summary.whoIsAtRisk.text).toEqual(
          'some information for who is at risk'
        )
        expect(view.supplementaryRiskInformationArgs.summary.natureOfRisk.text).toEqual(
          'some information on the nature of risk'
        )
        expect(view.supplementaryRiskInformationArgs.summary.riskImminence.text).toEqual(
          'some information for when is the risk'
        )
        expect(view.supplementaryRiskInformationArgs.summary.riskImminence.text).toEqual(
          'some information for when is the risk'
        )
      })
    })

    describe('riskToSelf', () => {
      it('returns "Don\'t know" label text when null riskToSelf values provided ', () => {
        const riskSummary = riskSummaryFactory.build({
          riskToSelf: {
            suicide: null,
            selfHarm: null,
            hostelSetting: null,
            vulnerability: null,
          },
        })
        const view = new ArnRiskSummaryView(riskSummary, supplementaryRiskInformationFactory.build())
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Don\'t know" label text when no values provided', () => {
        const riskSummary = riskSummaryFactory.build({
          riskToSelf: {
            suicide: undefined,
            selfHarm: undefined,
            hostelSetting: undefined,
            vulnerability: undefined,
          },
        })
        const view = new ArnRiskSummaryView(riskSummary, supplementaryRiskInformationFactory.build())
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Yes" label text when \'YES\' RiskResponse is provided', () => {
        const yesRisk: Risk = {
          risk: null,
          current: 'YES',
          currentConcernsText: null,
        }
        const view = new ArnRiskSummaryView(
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: yesRisk,
              selfHarm: yesRisk,
              hostelSetting: yesRisk,
              vulnerability: yesRisk,
            },
          }),
          supplementaryRiskInformationFactory.build()
        )
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.label.text).toEqual('Yes')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual('Yes')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual('Yes')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual('Yes')
      })

      it('returns "No" label text when \'NO\' RiskResponse is provided', () => {
        const noRisk: Risk = {
          risk: null,
          current: 'NO',
          currentConcernsText: null,
        }
        const view = new ArnRiskSummaryView(
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: noRisk,
              selfHarm: noRisk,
              hostelSetting: noRisk,
              vulnerability: noRisk,
            },
          }),
          supplementaryRiskInformationFactory.build()
        )
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.label.text).toEqual('No')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual('No')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual('No')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual('No')
      })

      it("returns \"Don't know\" label text when 'DK' RiskResponse is provided", () => {
        const dkRisk: Risk = {
          risk: null,
          current: 'DK',
          currentConcernsText: null,
        }
        const view = new ArnRiskSummaryView(
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: dkRisk,
              selfHarm: dkRisk,
              hostelSetting: dkRisk,
              vulnerability: dkRisk,
            },
          }),
          supplementaryRiskInformationFactory.build()
        )
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns text when supplementary information provided', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
          redactedRisk: {
            concernsSelfHarm: 'some concerns for self harm',
            concernsSuicide: 'some concerns for suicide',
            concernsHostel: 'some concerns for hostel',
            concernsVulnerability: 'some concerns for vulnerability',
          },
        })
        const view = new ArnRiskSummaryView(riskSummaryFactory.build(), supplementaryRiskInformation)
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.text).toEqual('some concerns for suicide')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.text).toEqual('some concerns for self harm')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.text).toEqual('some concerns for hostel')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.text).toEqual(
          'some concerns for vulnerability'
        )
      })
    })
  })
})
