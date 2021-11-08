import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'
import supplementaryRiskInformationFactory from '../../../../../../testutils/factories/supplementaryRiskInformation'

describe('OasysRiskInformationPresenter', () => {
  describe('latestAssessment', () => {
    describe('when the risk summary has an "assessed on" date', () => {
      it('returns the correctly formatted date', () => {
        const riskSummary = riskSummaryFactory.build({ assessedOn: '2021-09-20T09:31:45.062Z' })
        const presenter = new OasysRiskInformationPresenter(
          'referralId',
          supplementaryRiskInformationFactory.build(),
          riskSummary,
          null
        )

        expect(presenter.latestAssessment).toEqual('20 September 2021')
      })
    })

    describe('when the risk summary has no "assessed on" date', () => {
      it('displays a "not found" message', () => {
        const riskSummary = riskSummaryFactory.build()
        riskSummary.assessedOn = undefined
        const presenter = new OasysRiskInformationPresenter(
          'referralId',
          supplementaryRiskInformationFactory.build(),
          riskSummary,
          null
        )

        expect(presenter.latestAssessment).toEqual('Assessment date not found')
      })
    })

    describe('when the risk summary has a null "assessed on" date', () => {
      it('displays a "not found" message', () => {
        const riskSummary = riskSummaryFactory.build({ assessedOn: null })
        const presenter = new OasysRiskInformationPresenter(
          'referralId',
          supplementaryRiskInformationFactory.build(),
          riskSummary,
          null
        )

        expect(presenter.latestAssessment).toEqual('Assessment date not found')
      })
    })
  })
})
