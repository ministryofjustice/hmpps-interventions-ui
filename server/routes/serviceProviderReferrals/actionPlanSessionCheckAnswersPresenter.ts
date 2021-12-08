import AppointmentSummary from '../appointments/appointmentSummary'
import { AppointmentSchedulingDetails } from '../../models/appointment'

export default class ActionPlanSessionCheckAnswersPresenter {
  constructor(
    private readonly appointmentSchedulingDetails: AppointmentSchedulingDetails | null,
    private readonly actionPlanId: string,
    private readonly sessionNumber: number,
    private readonly draftId: string
  ) {}

  get pastAppointment(): boolean {
    if (!this.appointmentSchedulingDetails || !this.appointmentSchedulingDetails.appointmentTime) {
      throw new Error('Draft has null data on check your answers page')
    }
    return new Date(this.appointmentSchedulingDetails.appointmentTime) < new Date()
  }

  readonly backLinkHref = `/service-provider/action-plan/${this.actionPlanId}/sessions/${this.sessionNumber}/edit/${this.draftId}/details`

  readonly formAction = `/service-provider/action-plan/${this.actionPlanId}/sessions/${this.sessionNumber}/edit/${this.draftId}/submit`

  readonly title = `Confirm session ${this.sessionNumber} details`

  readonly summary = (() => {
    if (this.appointmentSchedulingDetails === null) {
      throw new Error('Draft has null data on check your answers page')
    }
    return new AppointmentSummary(this.appointmentSchedulingDetails, null).appointmentSummaryList
  })()
}
