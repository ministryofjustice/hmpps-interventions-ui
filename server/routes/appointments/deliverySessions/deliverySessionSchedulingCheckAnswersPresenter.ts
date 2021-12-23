import { Draft } from '../../../services/draftsService'
import { DraftAppointmentBooking } from '../../serviceProviderReferrals/draftAppointmentBooking'
import AppointmentSummary from '../appointmentSummary'

export default class DeliverySessionSchedulingCheckAnswersPresenter {
  constructor(
    private readonly draft: Draft<DraftAppointmentBooking>,
    private readonly referralId: string,
    private readonly appointmentId: string | undefined,
    private readonly sessionNumber: number,
    private readonly action: 'schedule-appointment' | 'reschedule-appointment'
  ) {}

  get backLinkHref(): string {
    if (this.action === 'reschedule-appointment') {
      return `/service-provider/referral/${this.referralId}/session/${this.sessionNumber}/edit/${this.draft.id}/details`
    }
    return `/service-provider/referral/${this.referralId}/session/${this.sessionNumber}/appointment/${this.appointmentId}/edit/${this.draft.id}/details`
  }

  get formAction(): string {
    if (this.action === 'reschedule-appointment') {
      return `/service-provider/referral/${this.referralId}/session/${this.sessionNumber}/edit/${this.draft.id}/submit`
    }
    return `/service-provider/referral/${this.referralId}/session/${this.sessionNumber}/appointment/${this.appointmentId}/edit/${this.draft.id}/submit`
  }

  readonly title = `Confirm session ${this.sessionNumber} details`

  get pastAppointment(): boolean {
    if (this.draft.data === null) {
      throw new Error('Draft has null data on check your answers page')
    }
    return new Date(this.draft.data.appointmentTime!) < new Date()
  }

  readonly summary = (() => {
    if (this.draft.data === null) {
      throw new Error('Draft has null data on check your answers page')
    }

    return new AppointmentSummary(this.draft.data, null).appointmentSummaryList
  })()
}
