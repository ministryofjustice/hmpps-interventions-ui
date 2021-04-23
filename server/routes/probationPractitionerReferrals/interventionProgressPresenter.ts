import { ActionPlanAppointment, SentReferral, ServiceCategoryFull } from '../../services/interventionsService'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import { DeliusServiceUser } from '../../services/communityApiService'
import DateUtils from '../../utils/dateUtils'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'

export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategoryFull,
    serviceUser: DeliusServiceUser,
    private readonly actionPlanAppointments: ActionPlanAppointment[]
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral,
      serviceUser,
      'probation-practitioner'
    )
  }

  get referralAssigned(): boolean {
    return this.referral.assignedTo !== null
  }

  readonly text = {
    title: `${utils.convertToTitleCase(this.serviceCategory.name)} progress`,
  }

  readonly referralCancellationHref = `/probation-practitioner/referrals/${this.referral.id}/cancellation/reason`

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

    switch (status) {
      case SessionStatus.didNotAttend:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: `<a class="govuk-link" href="/probation-practitioner/action-plan/${this.referral.actionPlanId}/appointment/${appointment.sessionNumber}/post-session-feedback">View feedback form</a>`,
        }
      case SessionStatus.completed:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: `<a class="govuk-link" href="/probation-practitioner/action-plan/${this.referral.actionPlanId}/appointment/${appointment.sessionNumber}/post-session-feedback">View feedback form</a>`,
        }
      case SessionStatus.scheduled:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: '',
        }
      default:
        return {
          text: presenter.text,
          tagClass: presenter.tagClass,
          linkHTML: '',
        }
    }
  }

  readonly hasEndOfServiceReport = (this.referral.endOfServiceReport?.submittedAt ?? null) !== null

  readonly endOfServiceReportTableHeaders = ['Caseworker', 'Status', 'Action']

  get endOfServiceReportTableRows(): Record<string, unknown>[] {
    return [
      {
        caseworker: this.referral.assignedTo?.username ?? '',
        tagArgs: {
          text: this.endOfServiceReportTableParams.text,
          classes: this.endOfServiceReportTableParams.tagClass,
        },
        linkHtml: this.endOfServiceReportTableParams.linkHTML,
      },
    ]
  }

  private endOfServiceReportTableParams = {
    // At the moment this method is only used by the template when the end of service report is submitted, hence the hardcoded "Completed"
    text: 'Completed',
    tagClass: 'govuk-tag--green',
    linkHTML: `<a class="govuk-link" href="/probation-practitioner/end-of-service-report/${this.referral.endOfServiceReport?.id}">View</a>`,
  }
}
