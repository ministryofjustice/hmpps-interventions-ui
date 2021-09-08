import { Draft } from '../../services/draftsService'
import AppointmentSummary from '../appointments/appointmentSummary'
import { DraftAppointmentBooking } from './draftAppointmentBooking'

export default class ActionPlanSessionCheckAnswersPresenter {
  constructor(
    private readonly draft: Draft<DraftAppointmentBooking>,
    private readonly actionPlanId: string,
    private readonly sessionNumber: number
  ) {}

  readonly backLinkHref = `/service-provider/action-plan/${this.actionPlanId}/sessions/${this.sessionNumber}/edit/${this.draft.id}/details`

  readonly formAction = `/service-provider/action-plan/${this.actionPlanId}/sessions/${this.sessionNumber}/edit/${this.draft.id}/submit`

  readonly title = `Confirm session ${this.sessionNumber} details`

  readonly summary = (() => {
    if (this.draft.data === null) {
      throw new Error('Draft has null data on check your answers page')
    }

    return new AppointmentSummary(this.draft.data, null).appointmentSummaryList
  })()
}
