import SentReferral from '../../models/sentReferral'
import { ActionPlanAppointment } from '../../models/actionPlan'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import DateUtils from '../../utils/dateUtils'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'
import Intervention from '../../models/intervention'

interface ProgressSessionTableRow {
  sessionNumber: number
  appointmentTime: string
  tagArgs: { text: string; classes: string }
  link: { text: string | null; href: string | null }
}

interface EndOfServiceTableRow {
  caseworker: string
  tagArgs: { text: string; classes: string }
  link: { text: string; href: string }
}
export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly actionPlanAppointments: ActionPlanAppointment[]
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral.id,
      'probation-practitioner'
    )
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
        link: { text: sessionTableParams.linkText, href: sessionTableParams.linkHref },
      }
    })
  }

  private sessionTableParams(
    appointment: ActionPlanAppointment
  ): { text: string; tagClass: string; linkText: string | null; linkHref: string | null } {
    const status = sessionStatus.forAppointment(appointment)
    const presenter = new SessionStatusPresenter(status)

    switch (status) {
      case SessionStatus.didNotAttend:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkText: 'View feedback form',
          linkHref: `/probation-practitioner/action-plan/${this.referral.actionPlanId}/appointment/${appointment.sessionNumber}/post-session-feedback`,
        }
      case SessionStatus.completed:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkText: 'View feedback form',
          linkHref: `/probation-practitioner/action-plan/${this.referral.actionPlanId}/appointment/${appointment.sessionNumber}/post-session-feedback`,
        }
      case SessionStatus.scheduled:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkText: null,
          linkHref: null,
        }
      default:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkText: null,
          linkHref: null,
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
}
