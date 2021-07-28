import { SummaryListItem } from '../../utils/summaryList'
import { ActionPlanAppointment } from '../../models/actionPlan'
import Appointment from '../../models/appointment'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import PresenterUtils from '../../utils/presenterUtils'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

export default class AppointmentSummaryComponent {
  constructor(
    private readonly appointment: Appointment | ActionPlanAppointment,
    private readonly assignedCaseworker: AuthUserDetails | null = null
  ) {}

  private readonly appointmentDecorator = new AppointmentDecorator(this.appointment)

  get appointmentSummary(): SummaryListItem[] {
    return [
      this.assignedCaseworker !== null
        ? { key: 'Caseworker', lines: [`${this.assignedCaseworker.firstName} ${this.assignedCaseworker.lastName}`] }
        : null,
      {
        key: 'Date',
        lines: [PresenterUtils.govukFormattedDate(this.appointmentDecorator.britishDay!)],
      },
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
}
