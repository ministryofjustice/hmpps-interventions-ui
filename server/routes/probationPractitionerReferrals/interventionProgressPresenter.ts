import SentReferral from '../../models/sentReferral'
import ActionPlan from '../../models/actionPlan'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import DateUtils from '../../utils/dateUtils'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'
import Intervention from '../../models/intervention'
import SupplierAssessment from '../../models/supplierAssessment'
import SupplierAssessmentDecorator from '../../decorators/supplierAssessmentDecorator'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import { ActionPlanAppointment } from '../../models/appointment'
import ActionPlanProgressPresenter from '../shared/action-plan/actionPlanProgressPresenter'
import ApprovedActionPlanSummary from '../../models/approvedActionPlanSummary'

interface ProgressSessionTableRow {
  sessionNumber: number
  appointmentTime: string
  tagArgs: { text: string; classes: string }
  link: { text: string; href: string } | null
}

interface EndOfServiceTableRow {
  caseworker: string
  tagArgs: { text: string; classes: string }
  link: { text: string; href: string }
}

enum SupplierAssessmentStatus {
  awaitingCaseworker,
  notScheduled,
  scheduled,
  delivered,
}

export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  actionPlanProgressPresenter: ActionPlanProgressPresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly actionPlanAppointments: ActionPlanAppointment[],
    private readonly actionPlan: ActionPlan | null,
    private readonly approvedActionPlanSummaries: ApprovedActionPlanSummary[],
    private readonly supplierAssessment: SupplierAssessment,
    private readonly assignee: AuthUserDetails | null,
    private readonly dashboardOriginPage?: string
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral.id,
      'probation-practitioner'
    )
    this.actionPlanProgressPresenter = new ActionPlanProgressPresenter(
      referral.id,
      actionPlan,
      approvedActionPlanSummaries,
      'probation-practitioner'
    )
  }

  get referralAssigned(): boolean {
    return this.assignee !== null
  }

  get referralEndRequested(): boolean {
    return this.referral.endRequestedAt !== null
  }

  get canCancelReferral(): boolean {
    return !this.referralEndRequested && !this.referralConcluded
  }

  private readonly referralConcluded = this.referral.concludedAt !== null

  get referralEndRequestedText(): string {
    if (!this.referral.endRequestedAt) {
      return ''
    }
    const shortenedDateString = DateUtils.formattedDate(this.referral.endRequestedAt)
    return `You requested to end this service on ${shortenedDateString}.`
  }

  readonly text = {
    title: `${utils.convertToTitleCase(this.intervention.contractType.name)}: progress`,
  }

  get assignedCaseworkerFullName(): string | null {
    return this.referralAssigned ? `${this.assignee!.firstName} ${this.assignee!.lastName}` : null
  }

  get assignedCaseworkerEmail(): string | null {
    return this.referralAssigned ? `${this.assignee!.email}` : null
  }

  readonly referralCancellationHref = `/probation-practitioner/referrals/${this.referral.id}/cancellation/start`

  readonly hasSessions = this.actionPlanAppointments.length !== 0

  readonly sessionTableHeaders = ['Session details', 'Date and time', 'Status', 'Action']

  get sessionTableRows(): ProgressSessionTableRow[] {
    if (!this.hasSessions) {
      return []
    }

    return this.actionPlanAppointments
      .map((appointment, index, array) => {
        const isParent =
          array.indexOf(appointment) === 0 ||
          (index > 0 && array[index - 1].sessionNumber !== appointment.sessionNumber)
        const sessionTableParams = this.sessionTableParams(appointment)
        return {
          isParent,
          sessionNumber: appointment.sessionNumber,
          appointmentTime: appointment.appointmentTime
            ? DateUtils.formattedDateTime(appointment.appointmentTime, { month: 'short', timeCasing: 'capitalized' })
            : '',
          tagArgs: { text: sessionTableParams.text, classes: sessionTableParams.tagClass },
          link: sessionTableParams.link,
        }
      })
      .sort((a, b) => {
        return a.sessionNumber - b.sessionNumber
      })
      .filter(x => x.isParent || (!x.isParent && x.tagArgs.text === 'did not attend'))
  }

  readonly hrefBackLink = this.dashboardOriginPage || '/probation-practioner/dashboard'

  private sessionTableParams(appointment: ActionPlanAppointment): {
    text: string
    tagClass: string
    link: { text: string; href: string } | null
  } {
    const status = sessionStatus.forAppointment(appointment)
    const presenter = new SessionStatusPresenter(status)

    switch (status) {
      case SessionStatus.didNotAttend:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          link: {
            text: 'View feedback form',
            href: `/probation-practitioner/referrals/${this.referral.id}/session/${appointment.sessionNumber}/appointment/${appointment.id}/post-session-feedback`,
          },
        }
      case SessionStatus.completed:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          link: {
            text: 'View feedback form',
            href: `/probation-practitioner/referrals/${this.referral.id}/session/${appointment.sessionNumber}/appointment/${appointment.id}/post-session-feedback`,
          },
        }
      case SessionStatus.awaitingFeedback:
      case SessionStatus.scheduled:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          link: null,
        }
      default:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          link: null,
        }
    }
  }

  readonly hasEndOfServiceReport = (this.referral.endOfServiceReport?.submittedAt ?? null) !== null

  readonly endOfServiceReportTableHeaders = ['Caseworker', 'Status', 'Action']

  get endOfServiceReportTableRows(): EndOfServiceTableRow[] {
    return [
      {
        caseworker: this.referral.assignedTo?.username ?? '',
        tagArgs: {
          text: this.endOfServiceReportTableParams.text,
          classes: this.endOfServiceReportTableParams.tagClass,
        },
        link: {
          href: this.endOfServiceReportTableParams.linkHref,
          text: this.endOfServiceReportTableParams.linkText,
        },
      },
    ]
  }

  private endOfServiceReportTableParams = {
    // At the moment this method is only used by the template when the end of service report is submitted, hence the hardcoded "Completed"
    text: 'Completed',
    tagClass: 'govuk-tag--green',
    linkHref: `/probation-practitioner/end-of-service-report/${this.referral.endOfServiceReport?.id}`,
    linkText: 'View',
  }

  private readonly supplierAssessmentSessionStatus = sessionStatus.forAppointment(
    new SupplierAssessmentDecorator(this.supplierAssessment).currentAppointment
  )

  readonly supplierAssessmentSessionStatusPresenter = new SessionStatusPresenter(this.supplierAssessmentSessionStatus)

  private get supplierAssessmentStatus(): SupplierAssessmentStatus {
    switch (this.supplierAssessmentSessionStatus) {
      case SessionStatus.scheduled:
      case SessionStatus.awaitingFeedback:
        return SupplierAssessmentStatus.scheduled
      case SessionStatus.didNotAttend:
      case SessionStatus.completed:
        return SupplierAssessmentStatus.delivered
      case SessionStatus.notScheduled:
      default:
        return this.referral.assignedTo === null
          ? SupplierAssessmentStatus.awaitingCaseworker
          : SupplierAssessmentStatus.notScheduled
    }
  }

  readonly shouldDisplaySupplierAssessmentSummaryList =
    this.supplierAssessmentStatus !== SupplierAssessmentStatus.awaitingCaseworker

  get supplierAssessmentMessage(): string {
    switch (this.supplierAssessmentStatus) {
      case SupplierAssessmentStatus.notScheduled:
        return 'A caseworker has been assigned and will book the assessment appointment.'
      case SupplierAssessmentStatus.awaitingCaseworker:
        return 'Once a caseworker has been assigned the assessment will be booked.'
      case SupplierAssessmentStatus.scheduled:
        return 'The appointment has been scheduled by the supplier.'
      case SupplierAssessmentStatus.delivered:
        return 'The initial assessment has been delivered and feedback added.'
      default:
        throw new Error('unexpected status')
    }
  }

  get supplierAssessmentLink(): { text: string; href: string } | null {
    switch (this.supplierAssessmentSessionStatus) {
      case SessionStatus.scheduled:
      case SessionStatus.awaitingFeedback:
        return {
          text: 'View appointment details',
          href: `/probation-practitioner/referrals/${this.referral.id}/supplier-assessment`,
        }
      case SessionStatus.completed:
      case SessionStatus.didNotAttend:
        return {
          text: 'View feedback',
          href: `/probation-practitioner/referrals/${this.referral.id}/supplier-assessment/post-assessment-feedback`,
        }
      default:
        return null
    }
  }
}
