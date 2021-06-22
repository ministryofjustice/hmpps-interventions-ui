import { ActionPlanAppointment } from '../../models/actionPlan'
import SentReferral from '../../models/sentReferral'
import { FormValidationError } from '../../utils/formValidationError'
import ScheduleAppointmentPresenter from './scheduleAppointmentPresenter'

export default class ScheduleActionPlanSessionPresenter extends ScheduleAppointmentPresenter {
  constructor(
    referral: SentReferral,
    currentAppointment: ActionPlanAppointment,
    validationError: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null,
    serverError: FormValidationError | null = null
  ) {
    super(referral, currentAppointment, validationError, userInputData, serverError)
    this.text.title = `Add session ${currentAppointment.sessionNumber} details`
  }
}
