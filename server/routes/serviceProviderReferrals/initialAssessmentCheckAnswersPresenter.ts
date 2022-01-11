import { Draft } from '../../services/draftsService'
import AppointmentSummary from '../appointments/appointmentSummary'
import { DraftAppointmentBooking } from './draftAppointmentBooking'

export default class InitialAssessmentCheckAnswersPresenter {
  constructor(private readonly draft: Draft<DraftAppointmentBooking>, private readonly referralId: string) {}

  readonly backLinkHref = `/service-provider/referrals/${this.referralId}/supplier-assessment/schedule/${this.draft.id}/details`

  readonly formAction = `/service-provider/referrals/${this.referralId}/supplier-assessment/schedule/${this.draft.id}/submit`

  readonly title = 'Confirm appointment details'

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
