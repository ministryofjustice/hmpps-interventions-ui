import { DetailsArgs, SummaryListArgs, SummaryListArgsRow, TableArgs } from '../../utils/govukFrontendTypes'
import utils from '../../utils/utils'
import RoshPanelPresenter from './roshPanelPresenter'
import logger from '../../../log'

export default class RoshPanelView {
  constructor(
    private readonly presenter: RoshPanelPresenter,
    private readonly userType: 'probation-practitioner' | 'service-provider'
  ) {}

  roshAnalysisTableArgs(): TableArgs {
    return {
      head: this.presenter.roshAnalysisHeaders.map((header: string) => {
        return { text: header }
      }),
      rows: this.presenter.roshAnalysisRows.map(row => {
        return [
          { text: utils.convertToProperCase(row.riskTo) },
          {
            html: `<span class="rosh-analysis-table__risk-score ${this.classForRiskScore(
              row.riskScore
            )}">${this.stringForRiskScore(row.riskScore)}</span>`,
          },
        ]
      }),
    }
  }

  private classForRiskScore(riskScore: string): string {
    switch (riskScore) {
      case 'LOW':
        return 'rosh-analysis-table__risk-score__low'
      case 'MEDIUM':
        return 'rosh-analysis-table__risk-score__medium'
      case 'HIGH':
        return 'rosh-analysis-table__risk-score__high'
      case 'VERY_HIGH':
        return 'rosh-analysis-table__risk-score__very-high'
      default:
        return ''
    }
  }

  private stringForRiskScore(riskScore: string): string {
    switch (riskScore) {
      case 'LOW':
        return 'Low'
      case 'MEDIUM':
        return 'Medium'
      case 'HIGH':
        return 'High'
      case 'VERY_HIGH':
        return 'Very high'
      default: {
        // If we encounter an unexpected risk level we should raise an error so it can be investigated, and return our best guess at a nicely formatted string.
        logger.error({
          err: `Encountered unexpected ROSH risk level "${riskScore}".`,
        })
        const lowerCasedRiskScore = riskScore.replace('_', ' ').toLowerCase()
        return lowerCasedRiskScore.charAt(0).toUpperCase() + lowerCasedRiskScore.slice(1)
      }
    }
  }

  summaryListArgsWithSummaryCardForRoshInfo(
    heading: string | null | undefined = null,
    options: { showBorders: boolean; showTitle: boolean } = { showBorders: true, showTitle: true }
  ): SummaryListArgs {
    return {
      card: (() => {
        if (options.showTitle) {
          return {
            title: {
              text: heading,
            },
          }
        }
        return null
      })(),
      classes: options.showBorders ? undefined : 'govuk-summary-list--no-border',
      rows: this.getRoshInfoSummaryListArg(),
    }
  }

  private getRoshInfoSummaryListArg(): SummaryListArgsRow[] {
    const summary: SummaryListArgsRow[] = []
    const title = {
      key: { html: `<p><b>Risk to</b></p>` },
      value: { html: `<p><b>Risk in community</b></p>` },
    }
    summary.push(title)
    summary.push(
      ...this.presenter.roshAnalysisRows.map(row => {
        return {
          key: {
            text: utils.convertToProperCase(row.riskTo),
          },
          value: (() => {
            const html = `<span class="${this.classForRiskScore(row.riskScore)}">${this.stringForRiskScore(
              row.riskScore
            )}</span>`
            return { html }
          })(),
        }
      })
    )

    const details = {
      key: {
        html: `<details class="govuk-details" data-module="govuk-details">
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
    </details>`,
      },
    }
    summary.push(details)

    return summary
  }

  get riskLevelDetailsArgs(): DetailsArgs {
    return {
      summaryText: 'Definitions of risk levels',
      html: `
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
            </ul>`,
    }
  }
}
