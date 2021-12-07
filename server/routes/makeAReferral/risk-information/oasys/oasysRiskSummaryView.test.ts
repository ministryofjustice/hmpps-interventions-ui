import riskSummaryFactory from '../../../../../testutils/factories/riskSummary'
import OasysRiskSummaryView from './oasysRiskSummaryView'
import { Risk } from '../../../../models/assessRisksAndNeeds/riskSummary'

describe('OasysRiskSummaryView', () => {
  describe('oasysRiskInformationArgs', () => {
    describe('additionalRiskInformation', () => {
      it('always returns "no additional information" label', () => {
        const riskSummary = riskSummaryFactory.build()
        const view = new OasysRiskSummaryView(riskSummary)
        expect(view.oasysRiskInformationArgs.additionalRiskInformation.label?.text).toEqual('None')
        expect(view.oasysRiskInformationArgs.additionalRiskInformation.text).toBeNull()
      })
    })

    describe('summary', () => {
      it('returns null text and label when null summary values provided ', () => {
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: null, natureOfRisk: null, riskImminence: null },
        })
        const view = new OasysRiskSummaryView(riskSummary)
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.riskImminence.label?.text).toEqual('No information provided')
      })

      it('returns null text and label when no summary values provided ', () => {
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: undefined, natureOfRisk: undefined, riskImminence: undefined },
        })
        const view = new OasysRiskSummaryView(riskSummary)
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.riskImminence.label?.text).toEqual('No information provided')
      })

      it('returns text and no label when summary values are provided ', () => {
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: 'whoIsAtRisk', natureOfRisk: 'natureOfRisk', riskImminence: 'riskImminence' },
        })
        const view = new OasysRiskSummaryView(riskSummary)
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.text).toEqual('whoIsAtRisk')
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.label).toBeUndefined()
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.text).toEqual('natureOfRisk')
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.label).toBeUndefined()
        expect(view.oasysRiskInformationArgs.summary.riskImminence.text).toEqual('riskImminence')
        expect(view.oasysRiskInformationArgs.summary.riskImminence.label).toBeUndefined()
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
        const view = new OasysRiskSummaryView(riskSummary)
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Don\'t know" label text when no values provided ', () => {
        const riskSummary = riskSummaryFactory.build({
          riskToSelf: {
            suicide: undefined,
            selfHarm: undefined,
            hostelSetting: undefined,
            vulnerability: undefined,
          },
        })
        const view = new OasysRiskSummaryView(riskSummary)
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Yes" label text when \'YES\' RiskResponse is provided', () => {
        const yesRisk: Risk = {
          risk: null,
          current: 'YES',
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: yesRisk,
              selfHarm: yesRisk,
              hostelSetting: yesRisk,
              vulnerability: yesRisk,
            },
          })
        )
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual('Yes')
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual('Yes')
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual('Yes')
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual('Yes')
      })

      it('returns "No" label text when \'NO\' RiskResponse is provided', () => {
        const noRisk: Risk = {
          risk: null,
          current: 'NO',
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: noRisk,
              selfHarm: noRisk,
              hostelSetting: noRisk,
              vulnerability: noRisk,
            },
          })
        )
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual('No')
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual('No')
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual('No')
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual('No')
      })

      it("returns \"Don't know\" label text when 'DK' RiskResponse is provided", () => {
        const dkRisk: Risk = {
          risk: null,
          current: 'DK',
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: dkRisk,
              selfHarm: dkRisk,
              hostelSetting: dkRisk,
              vulnerability: dkRisk,
            },
          })
        )
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Don\'t know" label text when no values for current are provided', () => {
        const nullRisk: Risk = {
          risk: null,
          current: null,
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: nullRisk,
              selfHarm: nullRisk,
              hostelSetting: nullRisk,
              vulnerability: nullRisk,
            },
          })
        )
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })
    })
  })
})
