import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'
import OasysRiskInformationView, { RiskInformationArgs } from './oasysRiskInformationView'
import { Risk } from '../../../../../models/assessRisksAndNeeds/riskSummary'
import supplementaryRiskInformationFactory from '../../../../../../testutils/factories/supplementaryRiskInformation'

describe('OasysRiskInformationView', () => {
  describe('riskInformation', () => {
    describe('additionalRiskInformation', () => {
      it('returns special content to display if no additional risk information has been provided', () => {
        const riskSummary = riskSummaryFactory.build()
        const presenter = new OasysRiskInformationPresenter(null, riskSummary)
        const view = new OasysRiskInformationView(presenter)
        const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
        expect(riskInformation.additionalRiskInformation.label).toHaveProperty('text', 'None')
      })

      describe('summary', () => {
        it('returns null text and label when null summary values provided ', () => {
          const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
          const riskSummary = riskSummaryFactory.build({
            summary: { whoIsAtRisk: null, natureOfRisk: null, riskImminence: null },
          })
          const presenter = new OasysRiskInformationPresenter(supplementaryRiskInformation, riskSummary)
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.summary.whoIsAtRisk.text).toBeNull()
          expect(riskInformation.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
          expect(riskInformation.summary.natureOfRisk.text).toBeNull()
          expect(riskInformation.summary.natureOfRisk.label?.text).toEqual('No information provided')
          expect(riskInformation.summary.riskImminence.text).toBeNull()
          expect(riskInformation.summary.riskImminence.label?.text).toEqual('No information provided')
        })

        it('returns null text and label when no summary values provided ', () => {
          const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
          const riskSummary = riskSummaryFactory.build({
            summary: { whoIsAtRisk: undefined, natureOfRisk: undefined, riskImminence: undefined },
          })
          const presenter = new OasysRiskInformationPresenter(supplementaryRiskInformation, riskSummary)
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.summary.whoIsAtRisk.text).toBeNull()
          expect(riskInformation.summary.whoIsAtRisk.label?.text).toEqual('No information provided')
          expect(riskInformation.summary.natureOfRisk.text).toBeNull()
          expect(riskInformation.summary.natureOfRisk.label?.text).toEqual('No information provided')
          expect(riskInformation.summary.riskImminence.text).toBeNull()
          expect(riskInformation.summary.riskImminence.label?.text).toEqual('No information provided')
        })

        it('returns text and no label when summary values are provided ', () => {
          const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
          const riskSummary = riskSummaryFactory.build({
            summary: { whoIsAtRisk: 'whoIsAtRisk', natureOfRisk: 'natureOfRisk', riskImminence: 'riskImminence' },
          })
          const presenter = new OasysRiskInformationPresenter(supplementaryRiskInformation, riskSummary)
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.summary.whoIsAtRisk.text).toEqual('whoIsAtRisk')
          expect(riskInformation.summary.whoIsAtRisk.label).toBeUndefined()
          expect(riskInformation.summary.natureOfRisk.text).toEqual('natureOfRisk')
          expect(riskInformation.summary.natureOfRisk.label).toBeUndefined()
          expect(riskInformation.summary.riskImminence.text).toEqual('riskImminence')
          expect(riskInformation.summary.riskImminence.label).toBeUndefined()
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
          const presenter = new OasysRiskInformationPresenter(supplementaryRiskInformation, riskSummary)
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
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
          const presenter = new OasysRiskInformationPresenter(supplementaryRiskInformation, riskSummary)
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
        })

        it('returns "Yes" label text when \'YES\' RiskResponse is provided', () => {
          const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
          const yesRisk: Risk = {
            risk: null,
            current: 'YES',
            currentConcernsText: null,
          }
          const presenter = new OasysRiskInformationPresenter(
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
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.riskToSelf.suicide.label.text).toEqual('Yes')
          expect(riskInformation.riskToSelf.selfHarm.label.text).toEqual('Yes')
          expect(riskInformation.riskToSelf.hostelSetting.label.text).toEqual('Yes')
          expect(riskInformation.riskToSelf.vulnerability.label.text).toEqual('Yes')
        })

        it('returns "No" label text when \'NO\' RiskResponse is provided', () => {
          const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
          const noRisk: Risk = {
            risk: null,
            current: 'NO',
            currentConcernsText: null,
          }
          const presenter = new OasysRiskInformationPresenter(
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
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.riskToSelf.suicide.label.text).toEqual('No')
          expect(riskInformation.riskToSelf.selfHarm.label.text).toEqual('No')
          expect(riskInformation.riskToSelf.hostelSetting.label.text).toEqual('No')
          expect(riskInformation.riskToSelf.vulnerability.label.text).toEqual('No')
        })

        it("returns \"Don't know\" label text when 'DK' RiskResponse is provided", () => {
          const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
          const dkRisk: Risk = {
            risk: null,
            current: 'DK',
            currentConcernsText: null,
          }
          const presenter = new OasysRiskInformationPresenter(
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
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
        })

        it('returns "Don\'t know" label text when no values for current are provided', () => {
          const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
          const nullRisk: Risk = {
            risk: null,
            current: null,
            currentConcernsText: null,
          }
          const presenter = new OasysRiskInformationPresenter(
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
          const view = new OasysRiskInformationView(presenter)
          const riskInformation = view.renderArgs[1].riskInformation as RiskInformationArgs
          expect(riskInformation.riskToSelf.suicide.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.selfHarm.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.hostelSetting.label.text).toEqual("Don't know")
          expect(riskInformation.riskToSelf.vulnerability.label.text).toEqual("Don't know")
        })
      })
    })
  })
})
