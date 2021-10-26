import ActionPlan from '../../models/actionPlan'
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
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../models/appointment'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

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

interface SupplierAssessmentAppointmentLink {
  text: string
  href: string
  hiddenText?: string
}

interface SupplierAssessmentTableRow {
  dateAndTime: string
  statusPresenter: SessionStatusPresenter
  action: SupplierAssessmentAppointmentLink[]
}

export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  actionPlanSummaryPresenter: ActionPlanSummaryPresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly actionPlan: ActionPlan | null,
    private readonly actionPlanAppointments: ActionPlanAppointment[],
    private readonly supplierAssessment: SupplierAssessment,
    private readonly assignee: AuthUserDetails | null
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
    return this.assignee !== null
  }

  get assignedCaseworkerFullName(): string | null {
    return this.referralAssigned ? `${this.assignee!.firstName} ${this.assignee!.lastName}` : null
  }

  get assignedCaseworkerEmail(): string | null {
    return this.referralAssigned ? `${this.assignee!.email}` : null
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

    return this.actionPlanAppointments
      .map(appointment => {
        const sessionTableParams = this.sessionTableParams(appointment)

        return {
          sessionNumber: appointment.sessionNumber,
          appointmentTime: appointment.appointmentTime
            ? DateUtils.formattedDateTime(appointment.appointmentTime, { month: 'short', timeCasing: 'capitalized' })
            : '',
          ...sessionTableParams,
        }
      })
      .sort((a, b) => a.sessionNumber - b.sessionNumber)
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
    const editHref = `/service-provider/action-plan/${this.actionPlan!.id}/sessions/${
      appointment.sessionNumber
    }/edit/start`
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
      case SessionStatus.awaitingFeedback:
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

  readonly viewEndOfServiceReportURL = this.referral.endOfServiceReport
    ? `/service-provider/end-of-service-report/${this.referral.endOfServiceReport.id}`
    : null

  readonly endOfServiceReportStatusStyle: 'active' | 'inactive' = this.endOfServiceReportSubmitted
    ? 'active'
    : 'inactive'

  get endOfServiceReportSubmitted(): boolean {
    return !!this.referral.endOfServiceReport?.submittedAt
  }

  get canSubmitEndOfServiceReport(): boolean {
    return this.referral.endOfServiceReportCreationRequired || this.endOfServiceReportStarted
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

  readonly supplierAssessmentTableHeaders = ['Date and time', 'Status', 'Action']

  get supplierAssessmentTableRows(): SupplierAssessmentTableRow[] {
    const decorator = new SupplierAssessmentDecorator(this.supplierAssessment)

    const appointments = decorator.sortedAppointments.map(appointment => {
      return {
        dateAndTime: decorator.appointmentDateAndTime(appointment),
        statusPresenter: this.supplierAssessmentAppointmentStatusPresenter(appointment),
        action: this.supplierAssessmentAppointmentLink(appointment),
      }
    })

    if (this.supplierAssessmentAppointment === null) {
      appointments.push({
        dateAndTime: decorator.appointmentDateAndTime(null),
        statusPresenter: this.supplierAssessmentAppointmentStatusPresenter(null),
        action: this.supplierAssessmentAppointmentLink(null),
      })
    }

    return appointments
  }

  readonly supplierAssessmentAppointment = new SupplierAssessmentDecorator(this.supplierAssessment).currentAppointment

  private supplierAssessmentAppointmentStatus(appointment: InitialAssessmentAppointment | null) {
    return sessionStatus.forAppointment(appointment)
  }

  get supplierAssessmentMessage(): string {
    switch (this.supplierAssessmentAppointmentStatus(this.supplierAssessmentAppointment)) {
      case SessionStatus.notScheduled:
        return 'Complete the initial assessment within 10 working days from receiving a new referral. Once you enter the appointment details, you will be able to change them.'
      case SessionStatus.awaitingFeedback:
      case SessionStatus.scheduled:
        return 'Feedback needs to be added on the same day the assessment is delivered.'
      case SessionStatus.completed:
      case SessionStatus.didNotAttend:
        return 'The initial assessment has been delivered and feedback added.'
      default:
        throw new Error('unexpected status')
    }
  }

  private supplierAssessmentAppointmentLink(
    appointment: InitialAssessmentAppointment | null
  ): SupplierAssessmentAppointmentLink[] {
    const { currentAppointment } = new SupplierAssessmentDecorator(this.supplierAssessment)

    const isCurrentAppointment =
      currentAppointment && appointment && currentAppointment.id && currentAppointment.id === appointment.id

    switch (this.supplierAssessmentAppointmentStatus(appointment)) {
      case SessionStatus.notScheduled:
        return [
          {
            text: 'Schedule',
            hiddenText: ' initial assessment',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/schedule/start`,
          },
        ]
      case SessionStatus.scheduled:
        return [
          {
            text: 'View details or reschedule',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment`,
          },
        ]
      case SessionStatus.awaitingFeedback:
        return [
          {
            text: 'Mark attendance and add feedback',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/post-assessment-feedback/attendance`,
          },
        ]
      case SessionStatus.didNotAttend:
        return isCurrentAppointment
          ? [
              {
                text: 'Reschedule',
                href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/schedule/start`,
              },
              {
                text: 'View feedback',
                href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/post-assessment-feedback`,
              },
            ]
          : [
              {
                text: 'View feedback',
                href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/post-assessment-feedback/${
                  appointment!.id
                }`,
              },
            ]
      case SessionStatus.completed:
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

  private supplierAssessmentAppointmentStatusPresenter(
    appointment: InitialAssessmentAppointment | null
  ): SessionStatusPresenter {
    return new SessionStatusPresenter(this.supplierAssessmentAppointmentStatus(appointment))
  }
}
