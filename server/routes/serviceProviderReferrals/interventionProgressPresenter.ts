import ActionPlan, { ActionPlanAppointment } from '../../models/actionPlan'
import SentReferral from '../../models/sentReferral'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import DateUtils from '../../utils/dateUtils'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'
import Intervention from '../../models/intervention'
import SupplierAssessment from '../../models/supplierAssessment'
import SupplierAssessmentDecorator from '../../decorators/supplierAssessmentDecorator'
import ActionPlanSummaryPresenter from '../shared/action-plan/actionPlanSummaryPresenter'

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

  actionPlanSummaryPresenter: ActionPlanSummaryPresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly actionPlan: ActionPlan | null,
    private readonly actionPlanAppointments: ActionPlanAppointment[],
    private readonly supplierAssessment: SupplierAssessment
  ) {
    const subNavUrlPrefix = 'service-provider'
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral.id,
      subNavUrlPrefix
    )
    this.actionPlanSummaryPresenter = new ActionPlanSummaryPresenter(referral, actionPlan, 'service-provider')
  }

  get referralAssigned(): boolean {
    return this.referral.assignedTo !== null
  }

  readonly text = {
    title: utils.convertToTitleCase(this.intervention.contractType.name),
    endOfServiceReportStatus: this.endOfServiceReportSubmitted ? 'Submitted' : 'Not submitted',
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

  get endOfServiceReportSubmitted(): boolean {
    return !!this.referral.endOfServiceReport?.submittedAt
  }

  get canSubmitEndOfServiceReport(): boolean {
    return this.referralAssigned && !this.endOfServiceReportSubmitted
  }

  private get endOfServiceReportStarted(): boolean {
    return this.referral.endOfServiceReport !== null && !this.endOfServiceReportSubmitted
  }

  get endOfServiceReportButtonActionText(): string | null {
    if (this.endOfServiceReportSubmitted) {
      return null
    }

    return this.endOfServiceReportStarted ? 'Continue' : 'Create'
  }

  private readonly supplierAssessmentStatus = sessionStatus.forAppointment(
    new SupplierAssessmentDecorator(this.supplierAssessment).currentAppointment
  )

  get supplierAssessmentMessage(): string {
    switch (this.supplierAssessmentStatus) {
      case SessionStatus.notScheduled:
        return 'Complete the initial assessment within 10 working days from receiving a new referral. Once you enter the appointment details, you will be able to change them.'
      case SessionStatus.scheduled:
        return 'Feedback needs to be added on the same day the assessment is delivered.'
      case SessionStatus.completed:
      case SessionStatus.didNotAttend:
        return 'The initial assessment has been delivered and feedback added.'
      default:
        throw new Error('unexpected status')
    }
  }

  get supplierAssessmentLink(): { text: string; href: string; hiddenText?: string }[] {
    switch (this.supplierAssessmentStatus) {
      case SessionStatus.notScheduled:
        return [
          {
            text: 'Schedule',
            hiddenText: ' initial assessment',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/schedule`,
          },
        ]
      case SessionStatus.scheduled:
        return [
          {
            text: 'View appointment details',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment`,
          },
          {
            text: 'Add feedback',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/post-assessment-feedback/attendance`,
          },
        ]
      case SessionStatus.completed:
      case SessionStatus.didNotAttend:
        return [
          {
            text: 'View feedback',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/post-assessment-feedback`,
          },
        ]
      default:
        throw new Error('unexpected status')
    }
  }

  get supplierAssessmentStatusPresenter(): SessionStatusPresenter {
    return new SessionStatusPresenter(this.supplierAssessmentStatus)
  }
}
