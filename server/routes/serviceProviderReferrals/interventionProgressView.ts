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
import ActionPlanProgressView from '../shared/action-plan/actionPlanProgressView'

export default class InterventionProgressView {
  actionPlanProgressView: ActionPlanProgressView

  constructor(private readonly presenter: InterventionProgressPresenter) {
    this.actionPlanProgressView = new ActionPlanProgressView(presenter.actionPlanProgressPresenter)
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

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.hrefBackLink,
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
        supplierAssessmentAppointmentsTableArgs: this.supplierAssessmentAppointmentsTableArgs.bind(this),
        supplierAssessmentMessage: this.presenter.supplierAssessmentMessage,
        actionPlanTableArgs: this.actionPlanProgressView.tableArgs.bind(this.actionPlanProgressView),
        backLinkArgs: this.backLinkArgs,
        endOfServiceReportSummaryListArgs: this.endOfServiceReportSummaryListArgs.bind(this),
        cancelledReferralNotificationBannerArgs: this.cancelledReferralNotificationBannerArgs,
      },
    ]
  }
}
