package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DeliverySessionService

@Component
class NdmisAppointmentPerformanceReportProcessor(
  private val deliverySessionService: DeliverySessionService,
) : ItemProcessor<Referral, List<AppointmentData>> {
  companion object : KLogging()

  override fun process(referral: Referral): List<AppointmentData>? {
    logger.debug("processing referral {}", kv("referralId", referral.id))

    if (referral.sentAt == null) throw RuntimeException("invalid referral passed to report processor; referral has not been sent")

    val deliveryAppointments = deliverySessionService.getSessions(referral.id).flatMap { it.appointments }
    val saaAppointments = referral.supplierAssessment?.appointments ?: emptySet()
    if (deliveryAppointments.isEmpty() && referral.supplierAssessment?.appointments?.size == 0) {
      return null
    }

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
        reasonForAppointment = if (saaAppointments.contains(it)) "saa" else "delivery"
      )
    }
  }
}
