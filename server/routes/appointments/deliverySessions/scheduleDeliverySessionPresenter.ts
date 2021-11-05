import { ActionPlanAppointment, AppointmentSchedulingDetails } from '../../../models/appointment'
import DeliusOfficeLocation from '../../../models/deliusOfficeLocation'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import ScheduleAppointmentPresenter from '../../serviceProviderReferrals/scheduleAppointmentPresenter'
import AppointmentSummary from '../appointmentSummary'

export default class ScheduleDeliverySessionPresenter extends ScheduleAppointmentPresenter {
  constructor(
    referral: SentReferral,
    currentAppointment: ActionPlanAppointment,
    currentAppointmentSummary: AppointmentSummary,
    deliusOfficeLocations: DeliusOfficeLocation[],
    validationError: FormValidationError | null = null,
    draftSchedulingDetails: AppointmentSchedulingDetails | null = null,
    userInputData: Record<string, unknown> | null = null,
    serverError: FormValidationError | null = null
  ) {
    super(
      'actionPlan',
      referral,
      currentAppointment,
      currentAppointmentSummary,
      deliusOfficeLocations,
      validationError,
      draftSchedulingDetails,
      userInputData,
      serverError
    )
    this.text.title = `Add session ${currentAppointment.sessionNumber} details`
  }
}
