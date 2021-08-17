import { DetailsArgs, SummaryListArgs, TableArgs, TagArgs } from '../../utils/govukFrontendTypes'
import utils from '../../utils/utils'
import RiskPresenter from './riskPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class RiskView {
  constructor(
    private readonly presenter: RiskPresenter,
    private readonly userType: 'probation-practitioner' | 'service-provider'
  ) {}

  roshAnalysisTableArgs(tagMacro: (args: TagArgs) => string): TableArgs {
    return {
      head: this.presenter.roshAnalysisHeaders.map((header: string) => {
        return { text: header }
      }),
      rows: this.presenter.roshAnalysisRows.map(row => {
        return [
          { text: utils.convertToProperCase(row.riskTo) },
          {
            text: tagMacro({
              text: row.riskScore.replace('_', ' '),
              classes: this.tagClassForRiskScore(row.riskScore),
            }),
          },
        ]
      }),
    }
  }

  private tagClassForRiskScore(riskScore: string): string {
    switch (riskScore) {
      case 'LOW':
        return 'govuk-tag--green'
      case 'MEDIUM':
        return 'govuk-tag--blue'
      case 'HIGH':
        return 'govuk-tag--red'
      case 'VERY_HIGH':
        return 'govuk-tag--purple'
      default:
        return ''
    }
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

  get riskToSelfSummaryListArgs(): SummaryListArgs {
    return ViewUtils.summaryListArgs(this.presenter.riskToSelf, [
      'govuk-summary-list--labeled-rows',
      'govuk-summary-list--questionnaire',
    ])
  }
}
