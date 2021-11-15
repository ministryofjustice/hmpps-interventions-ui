import riskSummaryFactory from '../../../../../../testutils/factories/riskSummary'
import supplementaryRiskInformationFactory from '../../../../../../testutils/factories/supplementaryRiskInformation'
import EditOasysRiskInformationPresenter from './editOasysRiskInformationPresenter'

describe('EditOasysRiskInformationPresenter', () => {
  describe('latestAssessment', () => {
    describe('when the risk summary has an "assessed on" date', () => {
      it('returns the correctly formatted date', () => {
        const riskSummary = riskSummaryFactory.build({ assessedOn: '2021-09-20T09:31:45.062Z' })
        const presenter = new EditOasysRiskInformationPresenter(
          supplementaryRiskInformationFactory.build(),
          riskSummary
        )

        expect(presenter.latestAssessment).toEqual('20 September 2021')
      })
    })
    describe('when the risk summary does not have an "assess on" date', () => {
      it('returns "Assessment date not found" when null', () => {
        const riskSummary = riskSummaryFactory.build({ assessedOn: null })
        const presenter = new EditOasysRiskInformationPresenter(
          supplementaryRiskInformationFactory.build(),
          riskSummary
        )

        expect(presenter.latestAssessment).toEqual('Assessment date not found')
      })
      it('returns "Assessment date not found" when undefined', () => {
        const riskSummary = riskSummaryFactory.build({ assessedOn: undefined })
        const presenter = new EditOasysRiskInformationPresenter(
          supplementaryRiskInformationFactory.build(),
          riskSummary
        )

        expect(presenter.latestAssessment).toEqual('Assessment date not found')
      })
    })
  })
})
