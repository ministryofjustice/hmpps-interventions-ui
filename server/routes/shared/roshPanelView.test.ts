import RoshPanelPresenter from './roshPanelPresenter'
import riskSummary from '../../../testutils/factories/riskSummary'
import RoshPanelView from './roshPanelView'

describe(RoshPanelView, () => {
  describe('buildRoshInfoSummaryListArg', () => {
    it('returns rows for each risk group in the correct order', () => {
      const presenter = new RoshPanelPresenter(riskSummary.build())
      const view = new RoshPanelView(presenter, 'probation-practitioner')
      const summaryListArgs = view.summaryListArgsWithSummaryCardForRoshInfo('Their risk information', {
        showBorders: true,
        showTitle: true,
      })
      const details = `<details class="govuk-details" data-module="govuk-details">
      <summary class="govuk-details__summary">
        <span class="govuk-details__summary-text">
          Definitions of risk levels
        </span>
      </summary>
      <div class="govuk-details__text">
      <ul class="govuk-list govuk-list--bullet">
      <li>
        <strong>Low</strong> - Current evidence does not indicate likelihood of causing serious harm.
      </li>
      <li>
        <strong>Medium</strong> - There are identifiable indicators of risk of serious harm. The person has the potential to cause serious harm but is unlikely to do so unless there is a change in circumstances.
      </li>
      <li>
        <strong>High</strong> - There are identifiable indicators of risk of serious harm. The potential event could happen at any time and the impact would be serious.
      </li>
      <li>
        <strong>Very high</strong> - There is an imminent risk of serious harm. The potential event is more likely than not to happen imminently and the impact would be serious.
      </li>
    </ul>
      </div>
    </details>`
      expect(summaryListArgs).toEqual({
        card: {
          title: {
            text: 'Their risk information',
          },
        },
        classes: undefined,
        rows: [
          {
            key: { html: '<p><b>Risk to</b></p>' },
            value: { html: '<p><b>Risk in community</b></p>' },
          },
          {
            key: { text: 'Children' },
            value: { html: '<span class="rosh-analysis-table__risk-score__high">High</span>' },
          },
          {
            key: { text: 'Public' },
            value: { html: '<span class="rosh-analysis-table__risk-score__low">Low</span>' },
          },
          {
            key: { text: 'Known adult' },
            value: { html: '<span class="rosh-analysis-table__risk-score__high">High</span>' },
          },
          {
            key: { text: 'Staff' },
            value: { html: '<span class="rosh-analysis-table__risk-score__very-high">Very high</span>' },
          },
          {
            key: {
              html: details,
            },
          },
        ],
      })
    })
  })
})
