import { SummaryListItem } from '../../utils/summaryList'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import PresenterUtils from '../../utils/presenterUtils'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import { InitialAssessmentAppointment, ActionPlanAppointment } from '../../models/appointment'
import User from '../../models/hmppsAuth/user'

export default class AppointmentSummary {
  constructor(
    private readonly appointment: InitialAssessmentAppointment | ActionPlanAppointment,
    private readonly assignedCaseworker: AuthUserDetails | User | null = null
  ) {}

  private readonly appointmentDecorator = new AppointmentDecorator(this.appointment)

  get appointmentSummaryList(): SummaryListItem[] {
    return [
      this.assignedCaseworkerListItem,
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

  private get assignedCaseworkerListItem(): { key: 'Caseworker'; lines: [string] } | null {
    if (this.assignedCaseworker == null) {
      return null
    }
    if (this.isAuthUser(this.assignedCaseworker)) {
      return { key: 'Caseworker', lines: [`${this.assignedCaseworker.firstName} ${this.assignedCaseworker.lastName}`] }
    }
    return { key: 'Caseworker', lines: [this.assignedCaseworker.username] }
  }

  private isAuthUser(user: AuthUserDetails | User): user is AuthUserDetails {
    if ((<AuthUserDetails>user).firstName) {
      return true
    }
    return false
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
