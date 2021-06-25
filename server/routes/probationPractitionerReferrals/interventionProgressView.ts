import { TagArgs, TableArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'

import InterventionProgressPresenter from './interventionProgressPresenter'
import ActionPlanView from '../shared/actionPlanView'

export default class InterventionProgressView {
  actionPlanView: ActionPlanView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanView = new ActionPlanView(presenter.actionPlanPresenter, true)
  }

  private supplierAssessmentSummaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs | null {
    if (!this.presenter.shouldDisplaySupplierAssessmentSummaryList) {
      return null
    }

    return {
      rows: [
        {
          key: { text: 'Caseworker' },
          value: { text: this.presenter.supplierAssessmentCaseworker },
        },
        {
          key: { text: 'Appointment status' },
          value: {
            html: ViewUtils.sessionStatusTagHtml(this.presenter.supplierAssessmentSessionStatusPresenter, args =>
              tagMacro({ ...args, attributes: { ...(args.attributes ?? {}), id: 'supplier-assessment-status' } })
            ),
          },
        },
      ],
    }
  }

  private sessionTableArgs(tagMacro: (args: TagArgs) => string): TableArgs {
    return {
      head: this.presenter.sessionTableHeaders.map((header: string) => {
        return { text: header }
      }),
      rows: this.presenter.sessionTableRows.map(row => {
        return [
          { text: `Session ${row.sessionNumber}` },
          { text: `${row.appointmentTime}` },
          { text: tagMacro(row.tagArgs as TagArgs) },
          { html: row.link === null ? '' : ViewUtils.linkHtml([row.link]) },
        ]
      }),
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
    href: '/probation-practitioner/dashboard',
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/interventionProgress',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        supplierAssessmentSummaryListArgs: this.supplierAssessmentSummaryListArgs.bind(this),
        sessionTableArgs: this.sessionTableArgs.bind(this),
        endOfServiceReportTableArgs: this.endOfServiceReportTableArgs.bind(this),
        actionPlanSummaryListArgs: this.actionPlanView.actionPlanSummaryListArgs.bind(this.actionPlanView),
      },
    ]
  }
}
