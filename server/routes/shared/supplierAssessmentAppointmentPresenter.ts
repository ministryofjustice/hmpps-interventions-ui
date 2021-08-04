import SentReferral from '../../models/sentReferral'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import { SummaryListItem } from '../../utils/summaryList'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import AppointmentSummary from '../appointments/appointmentSummary'
import { InitialAssessmentAppointment } from '../../models/appointment'

interface SupplierAssessmentAppointmentPresenterOptions {
  readonly?: boolean
  includeAssignee?: boolean
  readonly userType: 'service-provider' | 'probation-practitioner'
}

export default class SupplierAssessmentAppointmentPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly appointment: InitialAssessmentAppointment,
    private readonly assignee: AuthUserDetails | null,
    private readonly options: SupplierAssessmentAppointmentPresenterOptions = { userType: 'service-provider' }
  ) {}

  private readonly appointmentSummaryComponent = new AppointmentSummary(
    this.appointment,
    this.options.includeAssignee ? this.assignee : null
  )

  get summary(): SummaryListItem[] {
    return this.appointmentSummaryComponent.appointmentSummaryList
  }

  get actionLink(): { href: string; text: string } | null {
    if (this.options.readonly) {
      return null
    }

    return sessionStatus.forAppointment(this.appointment) === SessionStatus.scheduled
      ? {
          href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/schedule`,
          text: 'Change appointment details',
        }
      : null
  }

  get backLinkHref(): string {
    return `/${this.options.userType}/referrals/${this.referral.id}/progress`
  }
}
