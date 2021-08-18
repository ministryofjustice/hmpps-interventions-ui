import { SummaryListItem } from '../../utils/summaryList'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import PresenterUtils from '../../utils/presenterUtils'
import { InitialAssessmentAppointment, ActionPlanAppointment } from '../../models/appointment'
import { AppointmentDeliveryType } from '../../models/appointmentDeliveryType'
import Address from '../../models/address'

interface Caseworker {
  username?: string
  firstName?: string
  lastName?: string
}
export default class AppointmentSummary {
  constructor(
    private readonly appointment: InitialAssessmentAppointment | ActionPlanAppointment,
    private readonly assignedCaseworker: Caseworker | null = null
  ) {}

  private readonly appointmentDecorator = new AppointmentDecorator(this.appointment)

  get appointmentSummaryList(): SummaryListItem[] {
    const summary: SummaryListItem[] = []
    const caseworkerName = this.assignedCaseworkerName
    if (caseworkerName !== null) {
      summary.push({ key: 'Caseworker', lines: [caseworkerName] })
    }
    if (this.appointmentDecorator.britishDay) {
      summary.push({
        key: 'Date',
        lines: [PresenterUtils.govukFormattedDate(this.appointmentDecorator.britishDay!)],
      })
    }
    if (this.appointmentDecorator.britishTime && this.appointmentDecorator.britishEndsAtTime) {
      summary.push({
        key: 'Time',
        lines: [
          PresenterUtils.formattedTimeRange(
            this.appointmentDecorator.britishTime!,
            this.appointmentDecorator.britishEndsAtTime!
          ),
        ],
      })
    }
    if (this.appointment.appointmentDeliveryType) {
      summary.push({
        key: 'Method',
        lines: [this.deliveryMethod(this.appointment.appointmentDeliveryType)],
      })
    }
    if (this.appointment.appointmentDeliveryAddress) {
      summary.push({ key: 'Address', lines: this.addressLines(this.appointment.appointmentDeliveryAddress) })
    }
    return summary
  }

  private get assignedCaseworkerName(): string | null {
    if (this.assignedCaseworker?.firstName || this.assignedCaseworker?.lastName) {
      const firstName = this.assignedCaseworker.firstName ? this.assignedCaseworker.firstName : ''
      const lastName = this.assignedCaseworker.lastName ? this.assignedCaseworker.lastName : ''
      return `${firstName} ${lastName}`.trim()
    }
    if (this.assignedCaseworker?.username) {
      return this.assignedCaseworker.username
    }
    return null
  }

  private deliveryMethod(appointmentDeliveryType: AppointmentDeliveryType): string {
    switch (appointmentDeliveryType) {
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
        throw new Error(`Unexpected delivery type ${appointmentDeliveryType}`)
    }
  }

  private addressLines(address: Address): string[] {
    return [
      address.firstAddressLine,
      address.secondAddressLine,
      address.townOrCity,
      address.county,
      address.postCode,
    ].flatMap(val => (val === null ? [] : [val]))
  }
}
