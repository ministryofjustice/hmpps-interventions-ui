import Appointment from '../../models/appointment'
import SentReferral from '../../models/sentReferral'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import { SummaryListItem } from '../../utils/summaryList'
import PresenterUtils from '../../utils/presenterUtils'
import AppointmentDecorator from '../../decorators/appointmentDecorator'

export default class SupplierAssessmentAppointmentPresenter {
  constructor(private readonly referral: SentReferral, private readonly appointment: Appointment) {}

  private readonly appointmentDecorator = new AppointmentDecorator(this.appointment)

  summary: SummaryListItem[] = [
    { key: 'Date', lines: [PresenterUtils.govukFormattedDate(this.appointmentDecorator.britishDay!)] },
    {
      key: 'Time',
      lines: [
        PresenterUtils.formattedTimeRange(
          this.appointmentDecorator.britishTime!,
          this.appointmentDecorator.britishEndsAtTime!
        ),
      ],
    },
  ]

  readonly actionLink: { href: string; text: string } | null =
    sessionStatus.forAppointment(this.appointment) === SessionStatus.scheduled
      ? {
          href: `/service-provider/referrals/${this.referral.id}/supplier-assessment/schedule`,
          text: 'Change appointment details',
        }
      : null

  readonly backLinkHref = `/service-provider/referrals/${this.referral.id}/progress`
}
