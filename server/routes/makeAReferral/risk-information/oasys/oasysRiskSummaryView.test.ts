import riskSummaryFactory from '../../../../../testutils/factories/riskSummary'
import supplementaryRiskInformationFactory from '../../../../../testutils/factories/supplementaryRiskInformation'
import OasysRiskSummaryView from './oasysRiskSummaryView'
import { Risk } from '../../../../models/assessRisksAndNeeds/riskSummary'

describe('OasysRiskSummaryView', () => {
  describe('oasysRiskInformationArgs', () => {
    describe('additionalRiskInformation', () => {
      it('returns special content to display if no additional risk information has been provided', () => {
        const riskSummary = riskSummaryFactory.build()
        const view = new OasysRiskSummaryView(null, riskSummary)
        expect(view.oasysRiskInformationArgs.additionalRiskInformation.label).toHaveProperty('text', 'None')
      })
    })

    describe('when riskSummary is empty', () => {
      it('should display empty values', () => {
        const view = new OasysRiskSummaryView(null, null)
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.riskImminence.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.text).toBeNull()
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.text).toBeNull()
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.text).toBeNull()
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.text).toBeNull()
      })
    })
    describe('summary', () => {
      it('returns null text and label when null summary values provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: null, natureOfRisk: null, riskImminence: null },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.riskImminence.label?.text).toEqual('No information provided')
      })

      it('returns null text and label when no summary values provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: undefined, natureOfRisk: undefined, riskImminence: undefined },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.natureOfRisk.label?.text).toEqual('No information provided')
        expect(view.oasysRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.oasysRiskInformationArgs.summary.riskImminence.label?.text).toEqual('No information provided')
      })

      it('returns text and no label when summary values are provided ', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const riskSummary = riskSummaryFactory.build({
          summary: { whoIsAtRisk: 'whoIsAtRisk', natureOfRisk: 'natureOfRisk', riskImminence: 'riskImminence' },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummary)
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
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
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
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
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
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual('Yes')
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual('Yes')
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual('Yes')
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual('Yes')
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
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual('No')
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual('No')
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual('No')
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual('No')
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
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
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
        expect(view.oasysRiskInformationArgs.riskToSelf.suicide.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
        expect(view.oasysRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual("Don't know")
      })
    })
  })

  describe('supplementaryRiskInformationArgs', () => {
    describe('additionalRiskInformation', () => {
      it('returns special content to display if no additional risk information has been provided', () => {
        const riskSummary = riskSummaryFactory.build()
        const view = new OasysRiskSummaryView(null, riskSummary)
        expect(view.supplementaryRiskInformationArgs.additionalRiskInformation.label).toHaveProperty('text', 'None')
      })
    })

    describe('summary', () => {
      it('returns null text when undefined redactedRisk provided', () => {
        const view = new OasysRiskSummaryView(
          supplementaryRiskInformationFactory.build({ redactedRisk: undefined }),
          null
        )
        expect(view.supplementaryRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.text).toBeNull()
      })

      it('returns null text and no label when no supplementary provided', () => {
        const view = new OasysRiskSummaryView(null, null)
        expect(view.supplementaryRiskInformationArgs.summary.whoIsAtRisk.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.summary.whoIsAtRisk.label).toBeUndefined()
        expect(view.supplementaryRiskInformationArgs.summary.natureOfRisk.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.summary.natureOfRisk.label).toBeUndefined()
        expect(view.supplementaryRiskInformationArgs.summary.riskImminence.text).toBeNull()
        expect(view.supplementaryRiskInformationArgs.summary.riskImminence.label).toBeUndefined()
      })

      it('returns text when supplementary information provided', () => {
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
          riskSummaryComments: 'Some risk information about the user',
          redactedRisk: {
            riskWho: 'some information for who is at risk',
            riskWhen: 'some information for when is the risk',
            riskNature: 'some information on the nature of risk',
          },
        })
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, null)
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
        const view = new OasysRiskSummaryView(null, riskSummary)
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
        const view = new OasysRiskSummaryView(null, riskSummary)
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
        const view = new OasysRiskSummaryView(
          null,
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: yesRisk,
              selfHarm: yesRisk,
              hostelSetting: yesRisk,
              vulnerability: yesRisk,
            },
          })
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
        const view = new OasysRiskSummaryView(
          null,
          riskSummaryFactory.build({
            riskToSelf: {
              suicide: noRisk,
              selfHarm: noRisk,
              hostelSetting: noRisk,
              vulnerability: noRisk,
            },
          })
        )
        expect(view.supplementaryRiskInformationArgs.riskToSelf.suicide.label.text).toEqual('No')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.selfHarm.label.text).toEqual('No')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.hostelSetting.label.text).toEqual('No')
        expect(view.supplementaryRiskInformationArgs.riskToSelf.vulnerability.label.text).toEqual('No')
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
        const view = new OasysRiskSummaryView(supplementaryRiskInformation, riskSummaryFactory.build())
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
