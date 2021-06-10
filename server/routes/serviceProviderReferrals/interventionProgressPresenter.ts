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
  tagArgs: { text: string; classes: string }
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
    actionPlanStatus: this.actionPlanSubmitted ? 'Submitted' : 'Not submitted',
    endOfServiceReportStatus: this.endOfServiceReportSubmitted ? 'Submitted' : 'Not submitted',
  }

  readonly actionPlanStatusStyle: 'active' | 'inactive' = this.actionPlanSubmitted ? 'active' : 'inactive'

  get actionPlanSubmitted(): boolean {
    return this.actionPlan?.submittedAt != null
  }

  get actionPlanExists(): boolean {
    return this.actionPlan !== null
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
        tagArgs: { text: sessionTableParams.text, classes: sessionTableParams.tagClass },
        links: sessionTableParams.links.map(link => ({ text: link.text, href: link.href })),
      }
    })
  }

  private sessionTableParams(appointment: ActionPlanAppointment): {
    text: string
    tagClass: string
    links: { text: string; href: string }[]
  } {
    const status = sessionStatus.forAppointment(appointment)
    const presenter = new SessionStatusPresenter(status)

    const viewHref = `/service-provider/action-plan/${this.actionPlan!.id}/appointment/${
      appointment.sessionNumber
    }/post-session-feedback`
    const editHref = `/service-provider/action-plan/${this.actionPlan!.id}/sessions/${appointment.sessionNumber}/edit`
    const giveFeedbackHref = `/service-provider/action-plan/${this.actionPlan?.id}/appointment/${appointment.sessionNumber}/post-session-feedback/attendance`

    switch (status) {
      case SessionStatus.didNotAttend:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          links: [
            {
              text: 'View feedback form',
              href: viewHref,
            },
          ],
        }
      case SessionStatus.completed:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          links: [
            {
              text: 'View feedback form',
              href: viewHref,
            },
          ],
        }
      case SessionStatus.scheduled:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          links: [
            {
              text: 'Reschedule session',
              href: editHref,
            },
            {
              text: 'Give feedback',
              href: giveFeedbackHref,
            },
          ],
        }
      default:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          links: [
            {
              text: 'Edit session details',
              href: editHref,
            },
          ],
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
