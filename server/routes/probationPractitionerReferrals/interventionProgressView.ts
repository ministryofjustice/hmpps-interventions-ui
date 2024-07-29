import { TagArgs, TableArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'

import InterventionProgressPresenter from './interventionProgressPresenter'
import ActionPlanProgressView from '../shared/action-plan/actionPlanProgressView'

export default class InterventionProgressView {
  actionPlanProgressView: ActionPlanProgressView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanProgressView = new ActionPlanProgressView(presenter.actionPlanProgressPresenter)
  }

  private supplierAssessmentAppointmentsTableArgs(tagMacro: (args: TagArgs) => string): TableArgs {
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
          {
            html: ViewUtils.linkHtml(row.action),
          },
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

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/interventionProgress',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        supplierAssessmentAppointmentsTableArgs: this.supplierAssessmentAppointmentsTableArgs.bind(this),
        endOfServiceReportTableArgs: this.endOfServiceReportTableArgs.bind(this),
        actionPlanTableArgs: this.actionPlanProgressView.tableArgs.bind(this.actionPlanProgressView),
      },
    ]
  }
}
