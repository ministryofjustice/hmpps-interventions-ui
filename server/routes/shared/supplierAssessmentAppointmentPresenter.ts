import Appointment from '../../models/appointment'
import SentReferral from '../../models/sentReferral'
import sessionStatus, { SessionStatus } from '../../utils/sessionStatus'
import { SummaryListItem } from '../../utils/summaryList'
import PresenterUtils from '../../utils/presenterUtils'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

interface SupplierAssessmentAppointmentPresenterOptions {
  readonly?: boolean
  includeAssignee?: boolean
  readonly userType: 'service-provider' | 'probation-practitioner'
}

export default class SupplierAssessmentAppointmentPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly appointment: Appointment,
    private readonly assignee: AuthUserDetails | null,
    private readonly options: SupplierAssessmentAppointmentPresenterOptions = { userType: 'service-provider' }
  ) {}

  private readonly appointmentDecorator = new AppointmentDecorator(this.appointment)

  get summary(): SummaryListItem[] {
    return [
      this.assignee !== null && this.options.includeAssignee
        ? { key: 'Caseworker', lines: [`${this.assignee.firstName} ${this.assignee.lastName}`] }
        : null,
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
      {
        key: 'Method',
        lines: [this.deliveryMethod],
      },
      this.addressLines === null ? null : { key: 'Address', lines: this.addressLines },
    ].flatMap(val => (val === null ? [] : [val]))
  }

  private get deliveryMethod(): string {
    switch (this.appointment.appointmentDeliveryType) {
      case 'PHONE_CALL':
        return 'Phone call'
      case 'VIDEO_CALL':
        return 'Video call'
      case 'IN_PERSON_MEETING_PROBATION_OFFICE':
        // We've not added this option to the input form yet so this is just a guess
        return 'In-person meeting (probation office)'
      case 'IN_PERSON_MEETING_OTHER':
        return 'In-person meeting'
      default:
        throw new Error(`Unexpected delivery type ${this.appointment.appointmentDeliveryType}`)
    }
  }

  private get addressLines(): string[] | null {
    if (this.appointment.appointmentDeliveryAddress === null) {
      return null
    }

    const address = this.appointment.appointmentDeliveryAddress
    return [
      address.firstAddressLine,
      address.secondAddressLine,
      address.townOrCity,
      address.county,
      address.postCode,
    ].flatMap(val => (val === null ? [] : [val]))
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
