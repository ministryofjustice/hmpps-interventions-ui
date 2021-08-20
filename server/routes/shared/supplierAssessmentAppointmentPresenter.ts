import SentReferral from '../../models/sentReferral'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import { SummaryListItem } from '../../utils/summaryList'
import AppointmentSummary from '../appointments/appointmentSummary'
import { InitialAssessmentAppointment } from '../../models/appointment'

interface SupplierAssessmentAppointmentPresenterOptions {
  readonly?: boolean
  readonly userType: 'service-provider' | 'probation-practitioner'
}

export default class SupplierAssessmentAppointmentPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly appointment: InitialAssessmentAppointment,
    readonly appointmentSummary: AppointmentSummary,
    private readonly options: SupplierAssessmentAppointmentPresenterOptions = { userType: 'service-provider' }
  ) {}

  get summary(): SummaryListItem[] {
    return this.appointmentSummary.appointmentSummaryList
  }

  get actionLink(): { href: string; text: string } | null {
    if (this.options.readonly) {
      return null
    }

    return sessionStatus.forAppointment(this.appointment) === SessionStatus.scheduled
      ? {
          href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/schedule/start`,
          text: 'Change appointment details',
        }
      : null
  }

  get backLinkHref(): string {
    return `/${this.options.userType}/referrals/${this.referral.id}/progress`
  }
}
