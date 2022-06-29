import { TagArgs, TableArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'

import InterventionProgressPresenter from './interventionProgressPresenter'
import ActionPlanProgressView from '../shared/action-plan/actionPlanProgressView'

export default class InterventionProgressView {
  actionPlanProgressView: ActionPlanProgressView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanProgressView = new ActionPlanProgressView(presenter.actionPlanProgressPresenter)
  }

  private supplierAssessmentSummaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs | null {
    if (!this.presenter.shouldDisplaySupplierAssessmentSummaryList) {
      return null
    }

    return {
      rows: [
        {
          key: { text: 'Appointment status' },
          value: {
            html: ViewUtils.sessionStatusTagHtml(this.presenter.supplierAssessmentSessionStatusPresenter, args =>
              tagMacro({ ...args, attributes: { ...(args.attributes ?? {}), id: 'supplier-assessment-status' } })
            ),
          },
        },
        this.presenter.supplierAssessmentLink
          ? {
              key: { text: 'To do' },
              value: {
                html: ViewUtils.linkHtml([this.presenter.supplierAssessmentLink]),
              },
            }
          : null,
      ].flatMap(val => (val === null ? [] : [val])),
    }
  }

  private endOfServiceReportTableArgs(tagMacro: (args: TagArgs) => string): TableArgs {
    return {
      head: this.presenter.endOfServiceReportTableHeaders.map((header: string) => {
        return { text: header }
      }),
      rows: this.presenter.endOfServiceReportTableRows.map(row => {
        return [
          { text: `${row.caseworker}` },
          { text: tagMacro(row.tagArgs as TagArgs) },
          { html: `${ViewUtils.linkHtml([row.link])}` },
        ]
      }),
    }
  }

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.hrefBackLink,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/interventionProgress',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        supplierAssessmentSummaryListArgs: this.supplierAssessmentSummaryListArgs.bind(this),
        endOfServiceReportTableArgs: this.endOfServiceReportTableArgs.bind(this),
        actionPlanTableArgs: this.actionPlanProgressView.tableArgs.bind(this.actionPlanProgressView),
      },
    ]
  }
}
