import { AppointmentDeliveryType } from '../../../models/appointmentDeliveryType'
import Address from '../../../models/address'
import SessionFeedback from '../../../models/sessionFeedback'

/* TODO: We need to unify the ActionPlanAppointment and Appointment classes so that this should not necessary.
    Currently this is not possible because ActionPlanAppointment has nullable fields whilst Appointment does not.
    This should be relatively simple to do by having a common interface but agreed to talk about it first.
*/
export interface AppointmentDetails {
  appointmentTime: string | null
  durationInMinutes: number | null
  appointmentDeliveryType: AppointmentDeliveryType | null
  appointmentDeliveryAddress: Address | null
  sessionFeedback: SessionFeedback
}
