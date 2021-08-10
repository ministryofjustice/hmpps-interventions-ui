// This is a copy of the AppointmentSchedulingDetails interface.
//
// It’s a separate type to make sure that we handle the migration of existing data
// when we modify that type or any of its nested types. (Let’s see how this works in practice.)
interface DraftAppointmentBookingSchedulingDetails {
  appointmentTime: string | null
  durationInMinutes: number | null
  sessionType: 'ONE_TO_ONE' | 'GROUP' | null
  appointmentDeliveryType:
    | 'PHONE_CALL'
    | 'VIDEO_CALL'
    | 'IN_PERSON_MEETING_PROBATION_OFFICE'
    | 'IN_PERSON_MEETING_OTHER'
    | null
  appointmentDeliveryAddress: {
    firstAddressLine: string
    secondAddressLine: string | null
    townOrCity: string
    county: string
    postCode: string
  } | null
  npsOfficeCode: string | null
}

export type DraftAppointmentBooking = null | DraftAppointmentBookingSchedulingDetails
