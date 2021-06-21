import {
  NotificationBannerArgs,
  SummaryListArgs,
  SummaryListArgsRow,
  TableArgs,
  TagArgs,
} from '../../utils/govukFrontendTypes'

import ViewUtils from '../../utils/viewUtils'
import InterventionProgressPresenter from './interventionProgressPresenter'
import DateUtils from '../../utils/dateUtils'
import ActionPlanView from '../shared/actionPlanView'

export default class InterventionProgressView {
  actionPlanView: ActionPlanView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanView = new ActionPlanView(presenter.actionPlanPresenter, true)
  }

  get cancelledReferralNotificationBannerArgs(): NotificationBannerArgs {
    let cancellationReasonHTML = ''
    let cancellationCommentsHTML = ''
    let notConcludedWarningHTML = ''
    if (this.presenter.referralEndedFields.endRequestedAt && this.presenter.referralEndedFields.endRequestedReason) {
      const formattedEndDate = DateUtils.getDateStringFromDateTimeString(
        this.presenter.referralEndedFields.endRequestedAt
      )
      cancellationReasonHTML = `
        <p>
            The probation practitioner ended this intervention on ${formattedEndDate} 
            with reason: ${ViewUtils.escape(this.presenter.referralEndedFields.endRequestedReason)}.
        </p>`
    }
    if (this.presenter.referralEndedFields.endRequestedComments) {
      cancellationCommentsHTML = `
        <p>
            Additional information: ${ViewUtils.escape(this.presenter.referralEndedFields.endRequestedComments)}
        </p>`
    }
    if (!this.presenter.isConcluded) {
      notConcludedWarningHTML = `
            <p>
                Please note that an end of service report must still be submitted within 10 working days.
            </p>`
    }
    const html = `<div>${cancellationReasonHTML}${notConcludedWarningHTML}${cancellationCommentsHTML}</div>`
    return {
      titleText: 'Intervention ended',
      html,
      classes: 'govuk-notification-banner--warning',
    }
  }

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
          { html: this.linkHtml(row.links) },
        ]
      }),
    }
  }

  private linkHtml(links: { text: string; href: string }[]): string {
    return links
      .map(link => `<a class="govuk-link" href="${ViewUtils.escape(link.href)}">${ViewUtils.escape(link.text)}</a>`)
      .join('<br>')
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

    if (this.presenter.canSubmitEndOfServiceReport) {
      rows.push({
        key: { text: 'Action' },
        value: {
          html: `<form method="post" action="${ViewUtils.escape(this.presenter.createEndOfServiceReportFormAction)}">
                   <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken)}">
                   <button class="govuk-button govuk-button--secondary">
                     ${this.presenter.endOfServiceReportButtonActionText} end of service report
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
        initialAssessmentSummaryListArgs: this.initialAssessmentSummaryListArgs.bind(this),
        actionPlanSummaryListArgs: this.actionPlanView.actionPlanSummaryListArgs.bind(this.actionPlanView),
        sessionTableArgs: this.sessionTableArgs.bind(this),
        backLinkArgs: this.backLinkArgs,
        endOfServiceReportSummaryListArgs: this.endOfServiceReportSummaryListArgs.bind(this),
        cancelledReferralNotificationBannerArgs: this.cancelledReferralNotificationBannerArgs,
      },
    ]
  }
}
