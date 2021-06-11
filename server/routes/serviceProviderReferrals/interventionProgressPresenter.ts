import ActionPlan, { ActionPlanAppointment } from '../../models/actionPlan'
import SentReferral from '../../models/sentReferral'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import DateUtils from '../../utils/dateUtils'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'
import Intervention from '../../models/intervention'

interface EndedFields {
  endRequestedAt: string | null
  endRequestedComments: string | null
  endRequestedReason: string | null
}

interface ProgressSessionTableRow {
  sessionNumber: number
  appointmentTime: string
  statusPresenter: SessionStatusPresenter
  links: { text: string; href: string }[]
}

export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
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

  readonly actionPlanFormUrl = `/service-provider/action-plan/${this.actionPlan?.id}/add-activities`

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly text = {
    title: utils.convertToTitleCase(this.intervention.contractType.name),
    actionPlanStatus: this.actionPlanStatus,
    actionPlanSubmittedDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.submittedAt || null),
    // fixme: we don't have immediate access to the full name of the user without looking it up ahead of time
    // actionPlanSubmitter: this.actionPlan?.submittedBy.username\
    actionPlanApprovalDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.approvedAt || null),
    endOfServiceReportStatus: this.endOfServiceReportSubmitted ? 'Submitted' : 'Not submitted',
  }

  private get actionPlanStatus(): string {
    if (this.actionPlanApproved) {
      return 'Approved'
    }
    if (this.actionPlanUnderReview) {
      return 'Under review'
    }
    return 'Not submitted'
  }

  get actionPlanCreated(): boolean {
    return this.actionPlan !== null
  }

  get actionPlanUnderReview(): boolean {
    return this.actionPlan?.submittedAt != null && !this.actionPlanApproved
  }

  get actionPlanApproved(): boolean {
    return this.actionPlan?.approvedAt != null
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

  get isConcluded(): boolean {
    return this.referral.concludedAt !== null
  }

  readonly hasSessions = this.actionPlanAppointments.length !== 0

  readonly sessionTableHeaders = ['Session details', 'Date and time', 'Status', 'Action']

  get sessionTableRows(): ProgressSessionTableRow[] {
    if (!this.hasSessions) {
      return []
    }

    return this.actionPlanAppointments.map(appointment => {
      const sessionTableParams = this.sessionTableParams(appointment)

      return {
        sessionNumber: appointment.sessionNumber,
        appointmentTime: DateUtils.formatDateTimeOrEmptyString(appointment.appointmentTime),
        ...sessionTableParams,
      }
    })
  }

  private sessionTableParams(appointment: ActionPlanAppointment): {
    statusPresenter: SessionStatusPresenter
    links: { text: string; href: string }[]
  } {
    const status = sessionStatus.forAppointment(appointment)
    const presenter = new SessionStatusPresenter(status)

    const viewHref = `/service-provider/action-plan/${this.actionPlan!.id}/appointment/${
      appointment.sessionNumber
    }/post-session-feedback`
    const editHref = `/service-provider/action-plan/${this.actionPlan!.id}/sessions/${appointment.sessionNumber}/edit`
    const giveFeedbackHref = `/service-provider/action-plan/${this.actionPlan?.id}/appointment/${appointment.sessionNumber}/post-session-feedback/attendance`

    let links: { text: string; href: string }[] = []

    switch (status) {
      case SessionStatus.didNotAttend:
        links = [
          {
            text: 'View feedback form',
            href: viewHref,
          },
        ]
        break
      case SessionStatus.completed:
        links = [
          {
            text: 'View feedback form',
            href: viewHref,
          },
        ]
        break
      case SessionStatus.scheduled:
        links = [
          {
            text: 'Reschedule session',
            href: editHref,
          },
          {
            text: 'Give feedback',
            href: giveFeedbackHref,
          },
        ]
        break
      default:
        links = [
          {
            text: 'Edit session details',
            href: editHref,
          },
        ]
        break
    }

    return { statusPresenter: presenter, links }
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
