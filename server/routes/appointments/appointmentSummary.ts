import { SummaryListItem } from '../../utils/summaryList'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import { AppointmentDeliveryType } from '../../models/appointmentDeliveryType'
import Address from '../../models/address'
import DeliusOfficeLocation from '../../models/deliusOfficeLocation'
import DateUtils from '../../utils/dateUtils'
import { AppointmentSchedulingDetails } from '../../models/appointment'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

export default class AppointmentSummary {
  constructor(
    private readonly appointment: AppointmentSchedulingDetails,
    private readonly assignedCaseworker: AuthUserDetails | string | null = null,
    private readonly deliusOfficeLocation: DeliusOfficeLocation | null = null,
    private readonly feedbackSubmittedBy: AuthUserDetails | string | null = null
  ) {}

  private readonly appointmentDecorator = new AppointmentDecorator(this.appointment)

  get appointmentSummaryList(): SummaryListItem[] {
    const summary: SummaryListItem[] = []
    if (this.assignedCaseworker) {
      summary.push({ key: 'Current caseworker', lines: [this.assignedCaseworker] })
    }
    if (this.feedbackSubmittedBy) {
      summary.push({ key: 'Feedback submitted by', lines: [this.feedbackSubmittedBy] })
    }
    if (this.appointmentDecorator.britishDay) {
      summary.push({
        key: 'Date',
        lines: [DateUtils.formattedDate(this.appointmentDecorator.britishDay!)],
      })
    }
    if (this.appointmentDecorator.britishTime && this.appointmentDecorator.britishEndsAtTime) {
      summary.push({
        key: 'Time',
        lines: [
          DateUtils.formattedTimeRange(
            this.appointmentDecorator.britishTime!,
            this.appointmentDecorator.britishEndsAtTime!,
            { casing: 'capitalized' }
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
    if (
      this.appointment.appointmentDeliveryType === 'IN_PERSON_MEETING_OTHER' &&
      this.appointment.appointmentDeliveryAddress
    ) {
      summary.push({
        key: 'Address',
        lines: this.inPersonMeetingOtherAddressLines(this.appointment.appointmentDeliveryAddress),
      })
    } else if (
      this.appointment.appointmentDeliveryType === 'IN_PERSON_MEETING_PROBATION_OFFICE' &&
      this.appointment.npsOfficeCode &&
      this.deliusOfficeLocation
    ) {
      summary.push({
        key: 'Address',
        lines: this.inPersonMeetingProbationOfficeAddressLines(this.deliusOfficeLocation),
      })
    }
    return summary
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

  private inPersonMeetingProbationOfficeAddressLines(officeLocation: DeliusOfficeLocation): string[] {
    const addressLines = [officeLocation.name]
    officeLocation.address.split(',').forEach(line => addressLines.push(line))
    return addressLines
  }

  private inPersonMeetingOtherAddressLines(address: Address): string[] {
    return [
      address.firstAddressLine,
      address.secondAddressLine,
      address.townOrCity,
      address.county,
      address.postCode,
    ].flatMap(val => (val === null ? [] : [val]))
  }
}
