package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import java.time.OffsetDateTime
import java.util.*

data class AppointmentData(
  val referralReference: String,
  val referralId: UUID,
  val appointmentTime: OffsetDateTime,
  val durationInMinutes: Int,
  val bookedAt: OffsetDateTime,
  val attended: Attended?,
  val attendanceSubmittedAt: OffsetDateTime?,
  val notifyPPOfAttendanceBehaviour: Boolean?,
  val deliusAppointmentId: String,
  val reasonForAppointment: AppointmentReason // saa or delivery
) {
  companion object {
    val fields = listOf(
      "referralReference",
      "referralId",
      "appointmentTime",
      "durationInMinutes",
      "bookedAt",
      "attended",
      "attendanceSubmittedAt",
      "notifyPPOfAttendanceBehaviour",
      "deliusAppointmentId",
      "reasonForAppointment",
    )
    val headers = listOf(
      "referral_ref",
      "referral_id",
      "appointment_time",
      "duration_in_minutes",
      "booked_at",
      "attended",
      "attendance_submitted_at",
      "notifyppof_attendance_behaviour",
      "delius_appointment_id",
      "reason_for_appointment",
    )
  }
}

enum class AppointmentReason {
  SAA,
  DELIVERY;

//  override fun toString(): String {
//    return name.lowercase()
//  }
}
