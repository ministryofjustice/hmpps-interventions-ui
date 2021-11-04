package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.SentReferralProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DeliverySessionService

@Component
class AppointmentProcessor(
  private val deliverySessionService: DeliverySessionService,
) : SentReferralProcessor<List<AppointmentData>> {
  companion object : KLogging()

  override fun processSentReferral(referral: Referral): List<AppointmentData>? {
    val deliveryAppointments = deliverySessionService.getSessions(referral.id).flatMap { it.appointments }
    val saaAppointments = referral.supplierAssessment?.appointments ?: emptySet()

    return (deliveryAppointments + saaAppointments).map {
      AppointmentData(
        referralReference = referral.referenceNumber!!,
        referralId = referral.id,
        appointmentTime = it.appointmentTime,
        durationInMinutes = it.durationInMinutes,
        bookedAt = it.createdAt,
        attended = it.attended,
        attendanceSubmittedAt = it.attendanceSubmittedAt,
        notifyPPOfAttendanceBehaviour = it.notifyPPOfAttendanceBehaviour,
        deliusAppointmentId = it.deliusAppointmentId.toString(),
        reasonForAppointment = if (saaAppointments.contains(it)) AppointmentReason.SAA else AppointmentReason.DELIVERY
      )
    }.ifEmpty { null }
  }
}
