package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DeliverySessionService

@Component
class NdmisReferralsPerformanceReportProcessor(
  private val actionPlanService: ActionPlanService,
) : ItemProcessor<Referral, ReferralsData> {
  companion object : KLogging()

  override fun process(referral: Referral): ReferralsData {
    logger.debug("processing referral {}", kv("referralId", referral.id))

    if (referral.sentAt == null) throw RuntimeException("invalid referral passed to report processor; referral has not been sent")

    return ReferralsData(
      referralReference = referral.referenceNumber!!,
      referralId = referral.id,
      contractReference = referral.intervention.dynamicFrameworkContract.contractReference,
      contractType = referral.intervention.dynamicFrameworkContract.contractType.name,
      primeProvider = referral.intervention.dynamicFrameworkContract.primeProvider.name,
//      referringOfficerEmail = referral.re
//      relevantSentanceId = referral.relevantSentenceId!!,
      serviceUserCRN = referral.serviceUserCRN,
      dateReferralReceived = referral.sentAt!!,
      firstActionPlanSubmittedAt = referral.actionPlans?.mapNotNull { it.submittedAt }?.minOrNull(),
      firstActionPlanApprovedAt = referral.actionPlans?.mapNotNull { it.approvedAt }?.minOrNull(),
      numberOfOutcomes = referral.selectedDesiredOutcomes?.size,
      achievementScore = referral.endOfServiceReport?.achievementScore,
      numberOfSessions = referral.approvedActionPlan?.numberOfSessions,
      numberOfSessionsAttended = referral.approvedActionPlan?.let { actionPlanService.getAllAttendedAppointments(it).size },
      endRequestedAt = referral.endRequestedAt,
      endRequestedReason = referral.endRequestedReason?.description,
      eosrSubmittedAt = referral.endOfServiceReport?.submittedAt,
      endReasonCode = referral.endRequestedReason?.code,
      endReasonDescription = referral.endRequestedComments,
      concludedAt = referral.concludedAt
    )
  }
}

@Component
class NdmisComplexityPerformanceReportProcessor(
) : ItemProcessor<Referral, List<ComplexityData>> {
  companion object : KLogging()

  override fun process(referral: Referral): List<ComplexityData> {
    logger.debug("processing referral {}", kv("referralId", referral.id))

    if (referral.sentAt == null) throw RuntimeException("invalid referral passed to report processor; referral has not been sent")

    return referral.selectedServiceCategories!!.map {
      ComplexityData(
        referralReference = referral.referenceNumber!!,
        referralId = referral.id,
        interventionTitle = referral.intervention.title,
        serviceCategoryId = it.id,
        serviceCategoryName = it.name,
        complexityLevelTitle = it.complexityLevels.find {
            complexityLevel -> complexityLevel.id == referral.complexityLevelIds!![it.id]
        }!!.title
      )
    }
  }
}

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
