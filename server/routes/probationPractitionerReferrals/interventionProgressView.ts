import { TagArgs, TableArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'

import InterventionProgressPresenter from './interventionProgressPresenter'
import ActionPlanProgressView from '../shared/action-plan/actionPlanProgressView'
import config from '../../config'

export default class InterventionProgressView {
  actionPlanProgressView: ActionPlanProgressView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanProgressView = new ActionPlanProgressView(presenter.actionPlanProgressPresenter)
  }

  private supplierAssessmentSummaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs | null {
    // deprecated and switched by feature flag

    if (!this.presenter.shouldDisplaySupplierAssessmentSummaryList || config.featureFlags.progressScreensEnabled) {
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

  private supplierAssessmentSummaryTableArgs(tagMacro: (args: TagArgs) => string): TableArgs {
    return {
      head: this.presenter.supplierAssessmentTableHeaders.map((header: string) => ({ text: header })),
      rows: this.presenter.supplierAssessmentTableRows.map(row => {
        return [
          { text: row.dateAndTime },
          {
            html: ViewUtils.sessionStatusTagHtml(row.statusPresenter, args =>
              tagMacro({ ...args, attributes: { id: 'supplier-assessment-status' } })
            ),
          },
          row.action ? { html: `${ViewUtils.linkHtml([row.action])}` } : {},
        ]
      }),
      attributes: { 'data-cy': 'supplier-assessment-table' },
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

  private shouldDisplaySaaTable(): boolean {
    return config.featureFlags.progressScreensEnabled === true && this.presenter.displaySaaTable
  }

  private shouldDisplaySessionTable(): boolean {
    return config.featureFlags.progressScreensEnabled === false || this.presenter.displaySessionTable
  }

  private shouldDisplayActionPlanTable(): boolean {
    return config.featureFlags.progressScreensEnabled === false || this.presenter.displayActionPlanTable
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/interventionProgress',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        isSaaTableShown: this.shouldDisplaySaaTable(),
        isSessionTableShown: this.shouldDisplaySessionTable(),
        isActionPlanTableShown: this.shouldDisplayActionPlanTable(),
        supplierAssessmentSummaryListArgs: this.supplierAssessmentSummaryListArgs.bind(this),
        supplierAssessmentSummaryTableArgs: this.supplierAssessmentSummaryTableArgs.bind(this),
        endOfServiceReportTableArgs: this.endOfServiceReportTableArgs.bind(this),
        actionPlanTableArgs: this.actionPlanProgressView.tableArgs.bind(this.actionPlanProgressView),
      },
    ]
  }
}
