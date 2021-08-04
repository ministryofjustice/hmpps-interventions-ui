import { ActionPlanAppointment } from '../../../../../models/actionPlan'
import SentReferral from '../../../../../models/sentReferral'
import { FormValidationError } from '../../../../../utils/formValidationError'
import ScheduleAppointmentPresenter from '../../../../serviceProviderReferrals/scheduleAppointmentPresenter'
import AuthUserDetails from '../../../../../models/hmppsAuth/authUserDetails'

export default class ScheduleActionPlanSessionPresenter extends ScheduleAppointmentPresenter {
  constructor(
    referral: SentReferral,
    currentAppointment: ActionPlanAppointment,
    assignedCaseworker: AuthUserDetails | null = null,
    validationError: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null,
    serverError: FormValidationError | null = null
  ) {
    super(referral, currentAppointment, assignedCaseworker, validationError, userInputData, serverError)
    this.text.title = `Add session ${currentAppointment.sessionNumber} details`
  }
}
