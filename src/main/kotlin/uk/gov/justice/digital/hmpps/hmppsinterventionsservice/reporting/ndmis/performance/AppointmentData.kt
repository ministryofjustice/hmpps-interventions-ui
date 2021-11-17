package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import java.util.UUID

data class AppointmentData(
  val referralReference: String,
  val referralId: UUID,
  val appointmentId: UUID,
  val appointmentTime: NdmisDateTime,
  val durationInMinutes: Int,
  val bookedAt: NdmisDateTime,
  val attended: Attended?,
  val attendanceSubmittedAt: NdmisDateTime?,
  val notifyPPOfAttendanceBehaviour: Boolean?,
  val deliusAppointmentId: String,
  val reasonForAppointment: AppointmentReason
) {
  companion object {
    val fields = listOf(
      "referralReference",
      "referralId",
      "appointmentId",
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
      "appointmentId",
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

enum class AppointmentReason(
  val value: String,
) {
  SAA("saa"),
  DELIVERY("delivery");

  override fun toString(): String {
    return value
  }
}
