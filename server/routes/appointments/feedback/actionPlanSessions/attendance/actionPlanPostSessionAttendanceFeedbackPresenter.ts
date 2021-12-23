import { Appointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'
import AttendanceFeedbackQuestionnaire from '../../shared/attendance/attendanceFeedbackQuestionnaire'
import AppointmentSummary from '../../../appointmentSummary'

export default class ActionPlanPostSessionAttendanceFeedbackPresenter extends AttendanceFeedbackPresenter {
  constructor(
    private readonly actionPlanAppointment: Appointment,
    private readonly serviceUser: DeliusServiceUser,
    readonly appointmentSummary: AppointmentSummary,
    private readonly sessionNumber: string,
    private readonly referralId: string | null = null,
    private readonly actionPlanId: string | null = null,
    private readonly draftId: string | null = null,
    error: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null
  ) {
    super(
      actionPlanAppointment,
      `Add attendance feedback`,
      'Session details',
      new AttendanceFeedbackQuestionnaire(actionPlanAppointment, serviceUser),
      appointmentSummary,
      error,
      userInputData
    )
  }

  get pastAppointment(): boolean {
    return new Date(this.actionPlanAppointment.appointmentTime!) < new Date()
  }

  get getBackLinkHref(): string | null {
    if (this.actionPlanId && this.draftId) {
      return `/service-provider/action-plan/${this.actionPlanId}/sessions/${this.sessionNumber}/edit/${this.draftId}/check-answers`
    }
    if (this.referralId) {
      return `/service-provider/referrals/${this.referralId}/progress`
    }
    return null
  }

  readonly backLinkHref = this.getBackLinkHref
}
