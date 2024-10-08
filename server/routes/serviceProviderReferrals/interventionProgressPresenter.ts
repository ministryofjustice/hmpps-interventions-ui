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
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../models/appointment'
import AuthUserDetails, { authUserFullName } from '../../models/hmppsAuth/authUserDetails'
import ActionPlanProgressPresenter from '../shared/action-plan/actionPlanProgressPresenter'
import ApprovedActionPlanSummary from '../../models/approvedActionPlanSummary'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'

interface EndedFields {
  endRequestedAt: string | null
  endRequestedComments: string | null
  endRequestedReason: string | null
  withdrawalCode: string | null
  withdrawalComments: string | null
}

interface ProgressSessionTableRow {
  isParent?: boolean
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

  actionPlanProgressPresenter: ActionPlanProgressPresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly intervention: Intervention,
    private readonly actionPlan: ActionPlan | null,
    private readonly approvedActionPlanSummaries: ApprovedActionPlanSummary[],
    private readonly actionPlanAppointments: ActionPlanAppointment[],
    private readonly supplierAssessment: SupplierAssessment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly assignee: AuthUserDetails | null,
    private readonly dashboardOriginPage?: string,
    readonly showFeedbackBanner: boolean | null = null,
    readonly notifyPP: boolean | null = null,
    readonly dna: boolean | null = null,
    readonly isSupplierAssessmentAppointment: boolean | null = null
  ) {
    const subNavUrlPrefix = 'service-provider'
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral.id,
      subNavUrlPrefix
    )
    this.actionPlanProgressPresenter = new ActionPlanProgressPresenter(
      referral.id,
      actionPlan,
      approvedActionPlanSummaries,
      'service-provider'
    )
  }

  get referralAssigned(): boolean {
    return this.assignee !== null
  }

  get assignedCaseworkerFullName(): string | null {
    return this.referralAssigned ? authUserFullName(this.assignee!) : null
  }

  get assignedCaseworkerEmail(): string | null {
    return this.referralAssigned ? `${this.assignee!.email}` : null
  }

  readonly hrefBackLink = this.dashboardOriginPage || '/service-provider/dashboard'

  readonly text = {
    title: `${utils.convertToTitleCase(this.intervention.contractType.name)}: progress`,
    endOfServiceReportStatus: this.endOfServiceReportSubmitted ? 'Submitted' : 'Not submitted',
    feedbackAddedNotificationBannerHeading: `${
      this.isSupplierAssessmentAppointment ? 'Appointment' : 'Session'
    } feedback added`,
  }

  get referralEnded(): boolean {
    return this.referral.endRequestedAt !== null
  }

  get referralEndedFields(): EndedFields {
    return {
      endRequestedAt: this.referral.endRequestedAt,
      endRequestedComments: this.referral.endRequestedComments,
      endRequestedReason: this.referral.endRequestedReason,
      withdrawalCode: this.referral.withdrawalCode,
      withdrawalComments: this.referral.withdrawalComments,
    }
  }

  get withdrawalEndedBannerText(): string | null {
    if (this.referral.withdrawalCode) {
      return this.withdrawalCodeDisplayTextMap[this.referral.withdrawalCode]
    }
    return null
  }

  private withdrawalCodeDisplayTextMap = {
    INE: `This is because it was an ineligible referral.`,
    MIS: `This is because it was a mistaken or duplicate referral.`,
    NOT: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} was not engaged in the intervention.`,
    NEE: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}’s needs are being met through another route.`,
    MOV: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} has moved out of the service area.`,
    WOR: `This is due to ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}’s work/caring responsibilities or sickness.`,
    USE: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} has died.`,
    ACQ: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} was acquitted on appeal.`,
    RET: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} has returned to custody.`,
    SER: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}’s sentence was revoked.`,
    SEE: `This is because ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}’s sentence expired.`,
    EAR: `It has been closed early because the intervention has been completed.`,
    ANO: `This is due to a change of circumstance.`,
  }

  get isConcluded(): boolean {
    return this.referral.concludedAt !== null
  }

  readonly hasSessions = this.actionPlanAppointments.length !== 0

  readonly sessionTableHeaders = ['Session details', 'Time and date', 'Status', 'Action']

  get sessionTableRows(): ProgressSessionTableRow[] {
    if (!this.hasSessions) {
      return []
    }

    return this.actionPlanAppointments
      .map((appointment, index, array) => {
        const isDifferentSessionNumberFromPrevious =
          index > 0 && array[index - 1].sessionNumber !== appointment.sessionNumber
        const isParent = array.indexOf(appointment) === 0 || isDifferentSessionNumberFromPrevious
        const sessionTableParams = this.sessionTableParams(appointment, isParent)

        return {
          isParent,
          sessionNumber: appointment.sessionNumber,
          appointmentTime: appointment.appointmentTime
            ? DateUtils.formattedDateTime(appointment.appointmentTime, { month: 'short', timeCasing: 'capitalized' })
            : '',
          ...sessionTableParams,
        }
      })
      .sort((a, b) => {
        return a.sessionNumber - b.sessionNumber
      })
      .filter(
        x =>
          x.isParent ||
          (!x.isParent &&
            (x.statusPresenter.text === 'did not attend' ||
              x.statusPresenter.text === 'did not happen' ||
              x.statusPresenter.text === 'rescheduled'))
      )
  }

  private sessionTableParams(
    appointment: ActionPlanAppointment,
    isParent: boolean
  ): {
    statusPresenter: SessionStatusPresenter
    links: { text: string; href: string }[]
  } {
    const status = sessionStatus.forAppointment(appointment)
    const presenter = new SessionStatusPresenter(status)

    const viewHref = `/service-provider/action-plan/${this.actionPlan!.id}/session/${
      appointment.sessionNumber
    }/appointment/${appointment.appointmentId}/post-session-feedback`
    const viewRescheduledHref = `/service-provider/action-plan/${this.actionPlan!.id}/session/${
      appointment.sessionNumber
    }/appointment/${appointment.appointmentId}/rescheduled`
    const editHref = `/service-provider/action-plan/${this.actionPlan!.id}/sessions/${
      appointment.sessionNumber
    }/edit/start`
    const giveFeedbackHref = `/service-provider/action-plan/${this.actionPlan?.id}/appointment/${appointment.sessionNumber}/post-session-feedback/attendance`

    let links: { text: string; href: string }[] = []

    switch (status) {
      case SessionStatus.didNotAttend:
      case SessionStatus.didNotHappen:
        if (isParent) {
          links = [
            {
              text: 'View feedback form',
              href: viewHref,
            },
            {
              text: 'Reschedule session',
              href: editHref,
            },
          ]
        } else {
          links = [
            {
              text: 'View feedback form',
              href: viewHref,
            },
          ]
        }

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
        links = [
          {
            text: 'Give feedback',
            href: giveFeedbackHref,
          },
          {
            text: 'Reschedule session',
            href: editHref,
          },
        ]
        break
      case SessionStatus.notScheduled:
        links = [
          {
            text: 'Add session details',
            href: editHref,
          },
        ]
        break
      case SessionStatus.scheduled:
        links = [
          {
            text: 'Reschedule session',
            href: editHref,
          },
        ]
        break
      case SessionStatus.rescheduled:
        links = [
          {
            text: 'View appointment details',
            href: viewRescheduledHref,
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

  readonly supplierAssessmentTableHeaders = ['Time and date', 'Status', 'Action']

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
      case SessionStatus.didNotAttend:
      case SessionStatus.didNotHappen:
        return 'Feedback needs to be added on the same day the assessment is delivered.'
      case SessionStatus.completed:
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
      case SessionStatus.rescheduled:
        return [
          {
            text: 'View appointment details',
            href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/rescheduled/appointment/${
              appointment!.id
            }`,
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
      case SessionStatus.didNotHappen:
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

  get sessionFeedbackAddedNotificationBannerText(): string {
    if (this.dna) {
      return `The probation practitioner will get an email about ${this.serviceUser.name.forename} ${this.serviceUser.name.surname} not attending. They’ll also be able to view the feedback in the service.`
    }
    return this.notifyPP === true
      ? 'The probation practitioner has been emailed. They’ll also be able to view the feedback in the service.'
      : 'The probation practitioner will be able to view the feedback in the service.'
  }

  private supplierAssessmentAppointmentStatusPresenter(
    appointment: InitialAssessmentAppointment | null
  ): SessionStatusPresenter {
    return new SessionStatusPresenter(this.supplierAssessmentAppointmentStatus(appointment))
  }
}
