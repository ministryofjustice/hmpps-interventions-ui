import { ActionPlanAppointment } from '../../models/actionPlan'
import { FormValidationError } from '../../utils/formValidationError'
import ScheduleAppointmentPresenter from './scheduleAppointmentPresenter'

export default class ScheduleActionPlanSessionPresenter extends ScheduleAppointmentPresenter {
  constructor(
    currentAppointment: ActionPlanAppointment,
    validationError: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null,
    serverError: FormValidationError | null = null
  ) {
    super(currentAppointment, validationError, userInputData, serverError)
    this.text.title = `Add session ${currentAppointment.sessionNumber} details`
  }
}
