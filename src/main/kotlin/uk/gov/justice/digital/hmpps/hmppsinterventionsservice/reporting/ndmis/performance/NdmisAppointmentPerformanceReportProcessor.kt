package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DeliverySessionService

@Component
class NdmisAppointmentPerformanceReportProcessor(
  private val deliverySessionService: DeliverySessionService,
) : ItemProcessor<Referral, List<AppointmentData>> {
  companion object : KLogging()

  override fun process(referral: Referral): List<AppointmentData>? {
    logger.debug("processing referral {}", kv("referralId", referral.id))

    if (referral.sentAt == null) throw RuntimeException("invalid referral passed to report processor; referral has not been sent")

    val deliverySessions = deliverySessionService.getSessions(referral.id)
    if(deliverySessions.isEmpty() && referral.supplierAssessment?.appointments?.size == 0){
      return null
    }
    val deliverySessionAppointments = mutableListOf<AppointmentData>()

    deliverySessions.forEach {
      deliverySessionAppointments.addAll(it.appointments.map { appointment ->
        AppointmentData(
          referralReference = referral.referenceNumber!!,
          referralId = referral.id,
          appointmentTime = appointment.appointmentTime,
          durationInMinutes = appointment.durationInMinutes,
          bookedAt = appointment.createdAt,
          attended = appointment.attended,
          attendanceSubmittedAt = appointment.attendanceSubmittedAt,
          notifyPPOfAttendanceBehaviour = appointment.notifyPPOfAttendanceBehaviour,
          deliusAppointmentId = appointment.deliusAppointmentId.toString(),
          reasonForAppointment = "delivery"
        )
      }
      )
    }

    val saaSessionAppointments = referral.supplierAssessment?.appointments?.map { appointment ->
      AppointmentData(
        referralReference = referral.referenceNumber!!,
        referralId = referral.id,
        appointmentTime = appointment.appointmentTime,
        durationInMinutes = appointment.durationInMinutes,
        bookedAt = appointment.createdAt,
        attended = appointment.attended,
        attendanceSubmittedAt = appointment.attendanceSubmittedAt,
        notifyPPOfAttendanceBehaviour = appointment.notifyPPOfAttendanceBehaviour,
        deliusAppointmentId = appointment.deliusAppointmentId.toString(),
        reasonForAppointment = "saa"
      )
    }!!.toMutableList() //nullable??

    return deliverySessionAppointments + saaSessionAppointments

  }
}
