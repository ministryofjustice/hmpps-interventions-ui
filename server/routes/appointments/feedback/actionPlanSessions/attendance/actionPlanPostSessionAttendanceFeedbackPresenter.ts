import { ActionPlanAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'
import AttendanceFeedbackQuestionnaire from '../../shared/attendance/attendanceFeedbackQuestionnaire'
import AppointmentSummary from '../../../appointmentSummary'

export default class ActionPlanPostSessionAttendanceFeedbackPresenter extends AttendanceFeedbackPresenter {
  constructor(
    private readonly actionPlanAppointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    readonly appointmentSummary: AppointmentSummary,
    private readonly referralId: string | null = null,
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

  readonly backLinkHref = this.referralId ? `/service-provider/referrals/${this.referralId}/progress` : null
}
