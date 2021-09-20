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
import ActionPlanSummaryView from '../shared/action-plan/actionPlanSummaryView'

export default class InterventionProgressView {
  actionPlanSummaryView: ActionPlanSummaryView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanSummaryView = new ActionPlanSummaryView(presenter.actionPlanSummaryPresenter, true)
  }

  get cancelledReferralNotificationBannerArgs(): NotificationBannerArgs {
    let cancellationReasonHTML = ''
    let cancellationCommentsHTML = ''
    let notConcludedWarningHTML = ''
    if (this.presenter.referralEndedFields.endRequestedAt && this.presenter.referralEndedFields.endRequestedReason) {
      const formattedEndDate = DateUtils.formattedDate(this.presenter.referralEndedFields.endRequestedAt)
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
          key: { text: 'Appointment status' },
          value: {
            html: ViewUtils.sessionStatusTagHtml(this.presenter.supplierAssessmentStatusPresenter, args =>
              tagMacro({ ...args, attributes: { id: 'supplier-assessment-status' } })
            ),
          },
        },
        {
          key: { text: 'To do' },
          value: {
            html: ViewUtils.linkHtml(this.presenter.supplierAssessmentLink),
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
          { text: ViewUtils.sessionStatusTagHtml(row.statusPresenter, tagMacro) },
          { html: ViewUtils.linkHtml(row.links) },
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

    if (this.presenter.canSubmitEndOfServiceReport) {
      rows.push({
        key: { text: 'Action' },
        value: {
          html: `<form method="post" action="${ViewUtils.escape(this.presenter.createEndOfServiceReportFormAction)}">
                   <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken)}">
                   <button data-module="govuk-button" data-prevent-double-click="true">
                     ${this.presenter.endOfServiceReportButtonActionText} end of service report
                   </button>
                 </form>`,
        },
      })
    } else if (this.presenter.endOfServiceReportSubmitted && this.presenter.viewEndOfServiceReportURL) {
      rows.push({
        key: { text: 'Action' },
        value: {
          html: `<a href="${ViewUtils.escape(this.presenter.viewEndOfServiceReportURL)}">
                   <button data-module="govuk-button" data-prevent-double-click="true">
                     View submitted report
                   </button>
                 </a>`,
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
        supplierAssessmentMessage: this.presenter.supplierAssessmentMessage,
        actionPlanSummaryListArgs: this.actionPlanSummaryView.summaryListArgs.bind(this.actionPlanSummaryView),
        sessionTableArgs: this.sessionTableArgs.bind(this),
        backLinkArgs: this.backLinkArgs,
        endOfServiceReportSummaryListArgs: this.endOfServiceReportSummaryListArgs.bind(this),
        cancelledReferralNotificationBannerArgs: this.cancelledReferralNotificationBannerArgs,
      },
    ]
  }
}
