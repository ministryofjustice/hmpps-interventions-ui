import { ActionPlanAppointment } from '../../../../../models/appointment'
import SentReferral from '../../../../../models/sentReferral'
import { FormValidationError } from '../../../../../utils/formValidationError'
import ScheduleAppointmentPresenter from '../../../../serviceProviderReferrals/scheduleAppointmentPresenter'
import DeliusOfficeLocation from '../../../../../models/deliusOfficeLocation'
import AppointmentSummary from '../../../../appointments/appointmentSummary'

export default class ScheduleActionPlanSessionPresenter extends ScheduleAppointmentPresenter {
  constructor(
    referral: SentReferral,
    currentAppointment: ActionPlanAppointment,
    currentAppointmentSummary: AppointmentSummary,
    deliusOfficeLocations: DeliusOfficeLocation[],
    validationError: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null,
    serverError: FormValidationError | null = null
  ) {
    super(
      referral,
      currentAppointment,
      currentAppointmentSummary,
      deliusOfficeLocations,
      validationError,
      userInputData,
      serverError
    )
    this.text.title = `Add session ${currentAppointment.sessionNumber} details`
  }
}
