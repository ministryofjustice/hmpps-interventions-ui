import { ActionPlan, ActionPlanAppointment, SentReferral, ServiceCategory } from '../../services/interventionsService'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import DateUtils from '../../utils/dateUtils'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'

interface EndedFields {
  endRequestedAt: string | null
  endRequestedComments: string | null
  endRequestedReason: string | null
}
export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly actionPlan: ActionPlan | null,
    private readonly actionPlanAppointments: ActionPlanAppointment[]
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral.id,
      'service-provider'
    )
  }

  get referralAssigned(): boolean {
    return this.referral.assignedTo !== null
  }

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly text = {
    title: utils.convertToTitleCase(this.serviceCategory.name),
    actionPlanStatus: this.actionPlanSubmitted ? 'Submitted' : 'Not submitted',
    endOfServiceReportStatus: this.endOfServiceReportSubmitted ? 'Submitted' : 'Not submitted',
  }

  readonly actionPlanStatusStyle: 'active' | 'inactive' = this.actionPlanSubmitted ? 'active' : 'inactive'

  private get actionPlanSubmitted() {
    return this.actionPlan !== null && this.actionPlan.submittedAt !== null
  }

  get allowActionPlanCreation(): boolean {
    return this.actionPlan === null
  }

  get referralEnded(): boolean {
    return this.referral.endRequestedAt !== null
  }

  get referralEndedFields(): EndedFields {
    return {
      endRequestedAt: this.referral.endRequestedAt,
      endRequestedComments: this.referral.endRequestedComments,
      endRequestedReason: this.referral.endRequestedReason,
    }
  }

  readonly hasSessions = this.actionPlanAppointments.length !== 0

  readonly sessionTableHeaders = ['Session details', 'Date and time', 'Status', 'Action']

  get sessionTableRows(): Record<string, unknown>[] {
    if (!this.hasSessions) {
      return []
    }

    return this.actionPlanAppointments.map(appointment => {
      const sessionTableParams = this.sessionTableParams(appointment)

      return {
        sessionNumber: appointment.sessionNumber,
        appointmentTime: DateUtils.formatDateTimeOrEmptyString(appointment.appointmentTime),
        tagArgs: { text: sessionTableParams.text, classes: sessionTableParams.tagClass },
        linkHtml: sessionTableParams.linkHTML,
      }
    })
  }

  private sessionTableParams(appointment: ActionPlanAppointment): { text: string; tagClass: string; linkHTML: string } {
    const status = sessionStatus.forAppointment(appointment)
    const presenter = new SessionStatusPresenter(status)

    const editUrl = `/service-provider/action-plan/${this.actionPlan!.id}/sessions/${appointment.sessionNumber}/edit`

    switch (status) {
      case SessionStatus.didNotAttend:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: `<a class="govuk-link" href="/service-provider/action-plan/${this.actionPlan!.id}/appointment/${
            appointment.sessionNumber
          }/post-session-feedback">View feedback form</a>`,
        }
      case SessionStatus.completed:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: `<a class="govuk-link" href="/service-provider/action-plan/${this.actionPlan!.id}/appointment/${
            appointment.sessionNumber
          }/post-session-feedback">View feedback form</a>`,
        }
      case SessionStatus.scheduled:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: `<a class="govuk-link" href="${editUrl}">Reschedule session</a><br><a class="govuk-link" href="/service-provider/action-plan/${this.actionPlan?.id}/appointment/${appointment.sessionNumber}/post-session-feedback/attendance">Give feedback</a>`,
        }
      default:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: `<a class="govuk-link" href="${editUrl}">Edit session details</a>`,
        }
    }
  }

  readonly createEndOfServiceReportFormAction = `/service-provider/referrals/${this.referral.id}/end-of-service-report`

  readonly endOfServiceReportStatusStyle: 'active' | 'inactive' = this.endOfServiceReportSubmitted
    ? 'active'
    : 'inactive'

  private get endOfServiceReportSubmitted() {
    return this.referral.endOfServiceReport !== null && this.referral.endOfServiceReport.submittedAt !== null
  }

  get allowEndOfServiceReportCreation(): boolean {
    return this.referral.endOfServiceReport === null
  }
}
