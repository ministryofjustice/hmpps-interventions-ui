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
import ActionPlanSummaryView from '../shared/actionPlanSummaryView'

export default class InterventionProgressView {
  actionPlanSummaryView: ActionPlanSummaryView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanSummaryView = new ActionPlanSummaryView(presenter.actionPlanDetailsPresenter)
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

  private actionPlanSummaryListArgs(tagMacro: (args: TagArgs) => string, csrfToken: string): SummaryListArgs {
    const rows: SummaryListArgsRow[] = [
      {
        key: { text: 'Action plan status' },
        value: {
          text: tagMacro({
            text: this.presenter.actionPlanDetailsPresenter.text.actionPlanStatus,
            classes: this.actionPlanSummaryView.actionPlanTagClass,
            attributes: { id: 'action-plan-status' },
          }),
        },
      },
    ]

    if (!this.presenter.actionPlanDetailsPresenter.actionPlanCreated) {
      // action plan doesn't exist; show link to create one
      rows.push({
        key: { text: 'To do' },
        value: {
          html: `<form method="post" action="${ViewUtils.escape(
            this.presenter.actionPlanDetailsPresenter.createActionPlanFormAction
          )}">
                   <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken)}">
                   <button class="govuk-button govuk-button--secondary">
                     Create action plan
                   </button>
                 </form>`,
        },
      })
    } else if (
      this.presenter.actionPlanDetailsPresenter.actionPlanCreated &&
      !this.presenter.actionPlanDetailsPresenter.actionPlanUnderReview
    ) {
      // action plan exists, but has not been submitted
      rows.push({
        key: { text: 'To do' },
        value: {
          html: `<a href="${this.presenter.actionPlanDetailsPresenter.actionPlanFormUrl}" class="govuk-link">Submit action plan</a>`,
        },
      })
    } else if (this.presenter.actionPlanDetailsPresenter.actionPlanUnderReview) {
      // action plan has been submitted; show link to view it
      rows.push({
        key: { text: 'Submitted date' },
        value: {
          text: this.presenter.actionPlanDetailsPresenter.text.actionPlanSubmittedDate,
          classes: 'action-plan-submitted-date',
        },
      })
      rows.push({
        key: { text: 'To do' },
        value: {
          html: `<a href="${this.presenter.actionPlanDetailsPresenter.viewActionPlanUrl}" class="govuk-link">View action plan</a>`,
        },
      })
    } else if (this.presenter.actionPlanDetailsPresenter.actionPlanApproved) {
      // action plan has been approved; show link to view it
      rows.push({
        key: { text: 'Submitted date' },
        value: {
          text: this.presenter.actionPlanDetailsPresenter.text.actionPlanSubmittedDate,
          classes: 'action-plan-submitted-date',
        },
      })
      rows.push({
        key: { text: 'Approval date' },
        value: { text: this.presenter.actionPlanDetailsPresenter.text.actionPlanApprovalDate },
      })
      rows.push({
        key: { text: 'To do' },
        value: {
          html: `<a href="${this.presenter.actionPlanDetailsPresenter.viewActionPlanUrl}" class="govuk-link">View action plan</a>`,
        },
      })
    }

    return { rows }
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
        initialAssessmentSummaryListArgs: this.initialAssessmentSummaryListArgs.bind(this),
        actionPlanSummaryListArgs: this.actionPlanSummaryListArgs.bind(this),
        sessionTableArgs: this.sessionTableArgs.bind(this),
        backLinkArgs: this.backLinkArgs,
        endOfServiceReportSummaryListArgs: this.endOfServiceReportSummaryListArgs.bind(this),
        cancelledReferralNotificationBannerArgs: this.cancelledReferralNotificationBannerArgs,
      },
    ]
  }
}
