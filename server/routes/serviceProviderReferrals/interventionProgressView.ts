import { TagArgs, SummaryListArgs, SummaryListArgsRow, TableArgs } from '../../utils/govukFrontendTypes'

import ViewUtils from '../../utils/viewUtils'
import InterventionProgressPresenter from './interventionProgressPresenter'

export default class InterventionProgressView {
  constructor(private readonly presenter: InterventionProgressPresenter) {}

  private initialAssessmentSummaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs {
    return {
      rows: [
        {
          key: { text: 'Date' },
          value: { text: '' },
        },
        {
          key: { text: 'Time' },
          value: { text: '' },
        },
        {
          key: { text: 'Address' },
          value: { text: '' },
        },
        {
          key: { text: 'Appointment status' },
          value: { html: tagMacro({ text: 'Not scheduled', classes: 'govuk-tag--grey' }) },
        },
        {
          key: { text: 'Action' },
          value: { html: '<a href="#" class="govuk-link">Schedule</a>' },
        },
      ],
    }
  }

  private actionPlanSummaryListArgs(tagMacro: (args: TagArgs) => string, csrfToken: string): SummaryListArgs {
    const rows: SummaryListArgsRow[] = [
      {
        key: { text: 'Action plan status' },
        value: {
          text: tagMacro({
            text: this.presenter.text.actionPlanStatus,
            classes: this.actionPlanTagClass,
            attributes: { id: 'action-plan-status' },
          }),
        },
      },
    ]

    if (this.presenter.allowActionPlanCreation) {
      rows.push({
        key: { text: 'Action' },
        value: {
          html: `<form method="post" action="${ViewUtils.escape(this.presenter.createActionPlanFormAction)}">
                   <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken)}">
                   <button class="govuk-button govuk-button--secondary">
                     Create action plan
                   </button>
                 </form>`,
        },
      })
    }

    return { rows }
  }

  private readonly actionPlanTagClass = this.presenter.actionPlanStatusStyle === 'active' ? '' : 'govuk-tag--grey'

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
          { html: `${row.linkHtml}` },
        ]
      }),
    }
  }

  private readonly backLinkArgs = {
    text: 'Back',
    href: '/service-provider/dashboard',
  }

  private endOfServiceReportSummaryListArgs(tagMacro: (args: TagArgs) => string, csrfToken: string): SummaryListArgs {
    const rows: SummaryListArgsRow[] = [
      {
        key: { text: 'End of service report status' },
        value: {
          text: tagMacro({
            text: this.presenter.text.endOfServiceReportStatus,
            classes: this.endOfServiceReportTagClass,
            attributes: { id: 'end-of-service-report-status' },
          }),
        },
      },
    ]

    if (this.presenter.allowEndOfServiceReportCreation) {
      rows.push({
        key: { text: 'Action' },
        value: {
          html: `<form method="post" action="${ViewUtils.escape(this.presenter.createEndOfServiceReportFormAction)}">
                   <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken)}">
                   <button class="govuk-button govuk-button--secondary">
                     Create end of service report
                   </button>
                 </form>`,
        },
      })
    }

    return { rows }
  }

  private readonly endOfServiceReportTagClass =
    this.presenter.endOfServiceReportStatusStyle === 'active' ? '' : 'govuk-tag--grey'

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/interventionProgress',
      {
        presenter: this.presenter,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        serviceUserBannerArgs: this.presenter.referralOverviewPagePresenter.serviceUserBannerArgs,
        initialAssessmentSummaryListArgs: this.initialAssessmentSummaryListArgs.bind(this),
        actionPlanSummaryListArgs: this.actionPlanSummaryListArgs.bind(this),
        sessionTableArgs: this.sessionTableArgs.bind(this),
        backLinkArgs: this.backLinkArgs,
        endOfServiceReportSummaryListArgs: this.endOfServiceReportSummaryListArgs.bind(this),
      },
    ]
  }
}
