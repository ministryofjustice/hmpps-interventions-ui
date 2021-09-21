import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import draftReferralFactory from '../../../../../../testutils/factories/draftReferral'
import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'
import OasysRiskInformationView from './oasysRiskInformationView'
import { Risk } from '../../../../../models/assessRisksAndNeeds/riskSummary'

describe('OasysRiskInformationView', () => {
  describe('additionalRiskInformationResponse', () => {
    it('returns special content to display if no additional risk information has been provided', () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const riskSummary = riskSummaryFactory.build()
      const presenter = new OasysRiskInformationPresenter(referral, riskSummary)
      const view = new OasysRiskInformationView(presenter)
      expect(view.renderArgs[1].additionalRiskInformationResponse).toHaveProperty('text', 'None')
    })
  })

  describe('riskSummaryResponse', () => {
    it('returns correct response text when no null values provided ', () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const riskSummary = riskSummaryFactory.build({
        summary: { whoIsAtRisk: null, natureOfRisk: null, riskImminence: null },
      })
      const presenter = new OasysRiskInformationPresenter(referral, riskSummary)
      const view = new OasysRiskInformationView(presenter)
      expect(view.renderArgs[1].riskSummaryResponse).toEqual({
        whoIsAtRisk: expect.objectContaining({
          text: 'No information provided',
        }),
        natureOfRisk: expect.objectContaining({
          text: 'No information provided',
        }),
        riskImminence: expect.objectContaining({
          text: 'No information provided',
        }),
      })
    })

    it('returns correct response text when no values provided ', () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const riskSummary = riskSummaryFactory.build({
        summary: { whoIsAtRisk: undefined, natureOfRisk: undefined, riskImminence: undefined },
      })
      const presenter = new OasysRiskInformationPresenter(referral, riskSummary)
      const view = new OasysRiskInformationView(presenter)
      expect(view.renderArgs[1].riskSummaryResponse).toEqual({
        whoIsAtRisk: expect.objectContaining({
          text: 'No information provided',
        }),
        natureOfRisk: expect.objectContaining({
          text: 'No information provided',
        }),
        riskImminence: expect.objectContaining({
          text: 'No information provided',
        }),
      })
    })

    it('returns undefined when values are provided ', () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const riskSummary = riskSummaryFactory.build({
        summary: { whoIsAtRisk: 'whoIsAtRisk', natureOfRisk: 'natureOfRisk', riskImminence: 'riskImminence' },
      })
      const presenter = new OasysRiskInformationPresenter(referral, riskSummary)
      const view = new OasysRiskInformationView(presenter)
      expect(view.renderArgs[1].riskSummaryResponse).toEqual({
        whoIsAtRisk: undefined,
        natureOfRisk: undefined,
        riskImminence: undefined,
      })
    })
  })

  describe('riskToSelfResponse', () => {
    it('returns correct response text when null values provided ', () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const riskSummary = riskSummaryFactory.build({
        riskToSelf: {
          suicide: null,
          selfHarm: null,
          hostelSetting: null,
          vulnerability: null,
        },
      })
      const presenter = new OasysRiskInformationPresenter(referral, riskSummary)
      const view = new OasysRiskInformationView(presenter)
      expect(view.renderArgs[1].riskToSelfResponse).toEqual({
        suicide: expect.objectContaining({
          text: "Don't know",
        }),
        selfHarm: expect.objectContaining({
          text: "Don't know",
        }),
        hostelSetting: expect.objectContaining({
          text: "Don't know",
        }),
        vulnerability: expect.objectContaining({
          text: "Don't know",
        }),
      })
    })

    it('returns correct response text when no values provided ', () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const riskSummary = riskSummaryFactory.build({
        riskToSelf: {
          suicide: undefined,
          selfHarm: undefined,
          hostelSetting: undefined,
          vulnerability: undefined,
        },
      })
      const presenter = new OasysRiskInformationPresenter(referral, riskSummary)
      const view = new OasysRiskInformationView(presenter)
      expect(view.renderArgs[1].riskToSelfResponse).toEqual({
        suicide: expect.objectContaining({
          text: "Don't know",
        }),
        selfHarm: expect.objectContaining({
          text: "Don't know",
        }),
        hostelSetting: expect.objectContaining({
          text: "Don't know",
        }),
        vulnerability: expect.objectContaining({
          text: "Don't know",
        }),
      })
    })

    it("returns correct response when 'YES' values are provided", () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const yesRisk: Risk = {
        risk: null,
        current: 'YES',
        currentConcernsText: null,
      }
      const presenter = new OasysRiskInformationPresenter(
        referral,
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
      expect(view.renderArgs[1].riskToSelfResponse).toEqual({
        suicide: expect.objectContaining({
          text: 'Yes',
        }),
        selfHarm: expect.objectContaining({
          text: 'Yes',
        }),
        hostelSetting: expect.objectContaining({
          text: 'Yes',
        }),
        vulnerability: expect.objectContaining({
          text: 'Yes',
        }),
      })
    })

    it("returns correct response when 'NO' values are provided", () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const noRisk: Risk = {
        risk: null,
        current: 'NO',
        currentConcernsText: null,
      }
      const presenter = new OasysRiskInformationPresenter(
        referral,
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
      expect(view.renderArgs[1].riskToSelfResponse).toEqual({
        suicide: expect.objectContaining({
          text: 'No',
        }),
        selfHarm: expect.objectContaining({
          text: 'No',
        }),
        hostelSetting: expect.objectContaining({
          text: 'No',
        }),
        vulnerability: expect.objectContaining({
          text: 'No',
        }),
      })
    })

    it("returns correct response when 'DK' values are provided", () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const dkRisk: Risk = {
        risk: null,
        current: 'DK',
        currentConcernsText: null,
      }
      const presenter = new OasysRiskInformationPresenter(
        referral,
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
      expect(view.renderArgs[1].riskToSelfResponse).toEqual({
        suicide: expect.objectContaining({
          text: "Don't know",
        }),
        selfHarm: expect.objectContaining({
          text: "Don't know",
        }),
        hostelSetting: expect.objectContaining({
          text: "Don't know",
        }),
        vulnerability: expect.objectContaining({
          text: "Don't know",
        }),
      })
    })

    it('returns correct response when no values for current are provided', () => {
      const referral = draftReferralFactory.build({ additionalRiskInformation: null })
      const nullRisk: Risk = {
        risk: null,
        current: null,
        currentConcernsText: null,
      }
      const presenter = new OasysRiskInformationPresenter(
        referral,
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
      expect(view.renderArgs[1].riskToSelfResponse).toEqual({
        suicide: expect.objectContaining({
          text: "Don't know",
        }),
        selfHarm: expect.objectContaining({
          text: "Don't know",
        }),
        hostelSetting: expect.objectContaining({
          text: "Don't know",
        }),
        vulnerability: expect.objectContaining({
          text: "Don't know",
        }),
      })
    })
  })
})
