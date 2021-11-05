import { Draft } from '../../../services/draftsService'
import { DraftAppointmentBooking } from '../../serviceProviderReferrals/draftAppointmentBooking'
import AppointmentSummary from '../appointmentSummary'

export default class DeliverySessionSchedulingCheckAnswersPresenter {
  constructor(
    private readonly draft: Draft<DraftAppointmentBooking>,
    private readonly referralId: string,
    private readonly appointmentId: string,
    private readonly sessionNumber: number
  ) {}

  readonly backLinkHref = `/service-provider/referral/${this.referralId}/session/${this.sessionNumber}/appointment/${this.appointmentId}/edit/${this.draft.id}/details`

  readonly formAction = `/service-provider/referral/${this.referralId}/session/${this.sessionNumber}/appointment/${this.appointmentId}/edit/${this.draft.id}/submit`

  readonly title = `Confirm session ${this.sessionNumber} details`

  readonly summary = (() => {
    if (this.draft.data === null) {
      throw new Error('Draft has null data on check your answers page')
    }

    return new AppointmentSummary(this.draft.data, null).appointmentSummaryList
  })()
}
