import SentReferral from '../../models/sentReferral'
import ActionPlan, { ActionPlanAppointment } from '../../models/actionPlan'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import DateUtils from '../../utils/dateUtils'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'
import Intervention from '../../models/intervention'
import ActionPlanPresenter from '../shared/action-plan/actionPlanPresenter'
import SupplierAssessment from '../../models/supplierAssessment'
import SupplierAssessmentDecorator from '../../decorators/supplierAssessmentDecorator'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

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
}

export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  actionPlanPresenter: ActionPlanPresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly actionPlanAppointments: ActionPlanAppointment[],
    private readonly actionPlan: ActionPlan | null,
    private readonly supplierAssessment: SupplierAssessment,
    private readonly assignee: AuthUserDetails | null
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral.id,
      'probation-practitioner'
    )
    this.actionPlanPresenter = new ActionPlanPresenter(referral, actionPlan, 'probation-practitioner')
  }

  get referralAssigned(): boolean {
    return this.referral.assignedTo !== null
  }

  get referralEndRequested(): boolean {
    return this.referral.endRequestedAt !== null
  }

  get referralEndRequestedText(): string {
    const shortenedDateString = DateUtils.getDateStringFromDateTimeString(this.referral.endRequestedAt)

    if (!shortenedDateString) {
      return ''
    }

    return `You requested to end this service on ${shortenedDateString}.`
  }

  readonly text = {
    title: `${utils.convertToTitleCase(this.intervention.contractType.name)} progress`,
  }

  readonly referralCancellationHref = `/probation-practitioner/referrals/${this.referral.id}/cancellation/reason`

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
        link: sessionTableParams.link,
      }
    })
  }

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
            href: `/probation-practitioner/action-plan/${this.referral.actionPlanId}/appointment/${appointment.sessionNumber}/post-session-feedback`,
          },
        }
      case SessionStatus.completed:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          link: {
            text: 'View feedback form',
            href: `/probation-practitioner/action-plan/${this.referral.actionPlanId}/appointment/${appointment.sessionNumber}/post-session-feedback`,
          },
        }
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
    if (this.supplierAssessmentSessionStatus !== SessionStatus.notScheduled) {
      return SupplierAssessmentStatus.scheduled
    }

    return this.referral.assignedTo === null
      ? SupplierAssessmentStatus.awaitingCaseworker
      : SupplierAssessmentStatus.notScheduled
  }

  readonly shouldDisplaySupplierAssessmentSummaryList =
    this.supplierAssessmentStatus !== SupplierAssessmentStatus.awaitingCaseworker

  get supplierAssessmentMessage(): string {
    switch (this.supplierAssessmentStatus) {
      case SupplierAssessmentStatus.notScheduled:
        return 'A caseworker has been assigned and will book the assessment appointment with the service user.'
      case SupplierAssessmentStatus.awaitingCaseworker:
        return 'Once a caseworker has been assigned the assessment will be booked.'
      case SupplierAssessmentStatus.scheduled:
        return 'The appointment has been scheduled by the supplier.'
      default:
        throw new Error('unexpected status')
    }
  }

  get supplierAssessmentCaseworker(): string {
    return this.assignee ? `${this.assignee.firstName} ${this.assignee.lastName}` : ''
  }

  get supplierAssessmentLink(): { text: string; href: string } | null {
    if (this.supplierAssessmentStatus !== SupplierAssessmentStatus.scheduled) {
      return null
    }

    return {
      text: 'View appointment details',
      href: `/probation-practitioner/referrals/${this.referral.id}/supplier-assessment`,
    }
  }
}
