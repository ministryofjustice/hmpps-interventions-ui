import riskSummaryFactory from '../../../../../testutils/factories/riskSummary'
import supplementaryRiskInformationFactory from '../../../../../testutils/factories/supplementaryRiskInformation'
import OasysRiskSummaryView from './oasysRiskSummaryView'
import { Risk } from '../../../../models/assessRisksAndNeeds/riskSummary'

describe('OasysRiskSummaryView', () => {
  describe('riskInformation', () => {
    describe('additionalRiskInformation', () => {
      it('returns special content to display if no additional risk information has been provided', () => {
        const riskSummary = riskSummaryFactory.build()
        const view = new OasysRiskSummaryView(null, riskSummary)
        expect(view.riskInformation.additionalRiskInformation.label).toHaveProperty('text', 'None')
      })
    })

    describe('when riskSummary is empty', () => {
      it('should display empty values', () => {
        const view = new OasysRiskSummaryView(null, null)
        expect(view.riskInformation.summary.whoIsAtRisk.text).toBeNull()
        expect(view.riskInformation.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.riskInformation.summary.natureOfRisk.text).toBeNull()
        expect(view.riskInformation.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.riskInformation.summary.riskImminence.text).toBeNull()
        expect(view.riskInformation.summary.riskImminence.label?.text).toEqual('No information provided')
        expect(view.riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.suicide.text).toBeNull()
        expect(view.riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.selfHarm.text).toBeNull()
        expect(view.riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.hostelSetting.text).toBeNull()
        expect(view.riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.vulnerability.text).toBeNull()
      })
    })
    describe('summary', () => {
      it('returns null text and label when null summary values provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: null, natureOfRisk: null, riskImminence: null },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
        expect(view.riskInformation.summary.whoIsAtRisk.text).toBeNull()
        expect(view.riskInformation.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.riskInformation.summary.natureOfRisk.text).toBeNull()
        expect(view.riskInformation.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.riskInformation.summary.riskImminence.text).toBeNull()
        expect(view.riskInformation.summary.riskImminence.label?.text).toEqual('No information provided')
      })

      it('returns null text and label when no summary values provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: undefined, natureOfRisk: undefined, riskImminence: undefined },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
        expect(view.riskInformation.summary.whoIsAtRisk.text).toBeNull()
        expect(view.riskInformation.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.riskInformation.summary.natureOfRisk.text).toBeNull()
        expect(view.riskInformation.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.riskInformation.summary.riskImminence.text).toBeNull()
        expect(view.riskInformation.summary.riskImminence.label?.text).toEqual('No information provided')
      })

      it('returns text and no label when summary values are provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: 'whoIsAtRisk', natureOfRisk: 'natureOfRisk', riskImminence: 'riskImminence' },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
        expect(view.riskInformation.summary.whoIsAtRisk.text).toEqual('whoIsAtRisk')
        expect(view.riskInformation.summary.whoIsAtRisk.label).toBeUndefined()
        expect(view.riskInformation.summary.natureOfRisk.text).toEqual('natureOfRisk')
        expect(view.riskInformation.summary.natureOfRisk.label).toBeUndefined()
        expect(view.riskInformation.summary.riskImminence.text).toEqual('riskImminence')
        expect(view.riskInformation.summary.riskImminence.label).toBeUndefined()
      })
    })

    describe('riskToSelf', () => {
      it('returns "Don\'t know" label text when null riskToSelf values provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          riskToSelf: {
            suicide: null,
            selfHarm: null,
            hostelSetting: null,
            vulnerability: null,
          },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
        expect(view.riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Don\'t know" label text when no values provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          riskToSelf: {
            suicide: undefined,
            selfHarm: undefined,
            hostelSetting: undefined,
            vulnerability: undefined,
          },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
        expect(view.riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Yes" label text when \'YES\' RiskResponse is provided', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const yesRisk: Risk = {
          risk: null,
          current: 'YES',
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          supplementaryRiskInformation,
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: yesRisk,
              selfHarm: yesRisk,
              hostelSetting: yesRisk,
              vulnerability: yesRisk,
            },
          })
        )
        expect(view.riskInformation.riskToSelf.suicide.label.text).toEqual('Yes')
        expect(view.riskInformation.riskToSelf.selfHarm.label.text).toEqual('Yes')
        expect(view.riskInformation.riskToSelf.hostelSetting.label.text).toEqual('Yes')
        expect(view.riskInformation.riskToSelf.vulnerability.label.text).toEqual('Yes')
      })

      it('returns "No" label text when \'NO\' RiskResponse is provided', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const noRisk: Risk = {
          risk: null,
          current: 'NO',
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          supplementaryRiskInformation,
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: noRisk,
              selfHarm: noRisk,
              hostelSetting: noRisk,
              vulnerability: noRisk,
            },
          })
        )
        expect(view.riskInformation.riskToSelf.suicide.label.text).toEqual('No')
        expect(view.riskInformation.riskToSelf.selfHarm.label.text).toEqual('No')
        expect(view.riskInformation.riskToSelf.hostelSetting.label.text).toEqual('No')
        expect(view.riskInformation.riskToSelf.vulnerability.label.text).toEqual('No')
      })

      it("returns \"Don't know\" label text when 'DK' RiskResponse is provided", () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const dkRisk: Risk = {
          risk: null,
          current: 'DK',
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          supplementaryRiskInformation,
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: dkRisk,
              selfHarm: dkRisk,
              hostelSetting: dkRisk,
              vulnerability: dkRisk,
            },
          })
        )
        expect(view.riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })

      it('returns "Don\'t know" label text when no values for current are provided', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const nullRisk: Risk = {
          risk: null,
          current: null,
          currentConcernsText: null,
        }
        const view = new OasysRiskSummaryView(
          supplementaryRiskInformation,
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: nullRisk,
              selfHarm: nullRisk,
              hostelSetting: nullRisk,
              vulnerability: nullRisk,
            },
          })
        )
        expect(view.riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })
    })
  })
})
