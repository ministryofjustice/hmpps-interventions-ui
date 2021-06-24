package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.lang.IllegalStateException
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional
import javax.validation.constraints.NotNull

@Service
@Transactional
class CommunityAPIBookingService(
  @Value("\${community-api.appointments.bookings.enabled}") private val bookingsEnabled: Boolean,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("#{\${interventions-ui.probation-appointment-links}}") private val interventionsUIViewAppointmentLinks: Map<AppointmentType, String>,
  @Value("\${community-api.locations.book-appointment}") private val communityApiBookAppointmentLocation: String,
  @Value("\${community-api.locations.reschedule-appointment}") private val communityApiRescheduleAppointmentLocation: String,
  @Value("\${community-api.appointments.office-location}") private val officeLocation: String,
  @Value("#{\${community-api.appointments.notes-field-qualifier}}") private val notesFieldQualifier: Map<AppointmentType, String>,
  @Value("#{\${community-api.appointments.counts-towards-rar-days}}") private val countsTowardsRarDays: Map<AppointmentType, Boolean>,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  val communityAPIClient: CommunityAPIClient,
) : CommunityAPIService {
  companion object : KLogging()

  fun book(referral: Referral, existingAppointment: Appointment?, appointmentTime: OffsetDateTime, durationInMinutes: Int, appointmentType: AppointmentType): Long? {
    if (!bookingsEnabled) {
      return existingAppointment?.deliusAppointmentId
    }

    return processingBooking(referral, existingAppointment, appointmentTime, durationInMinutes, appointmentType)
  }

  private fun processingBooking(referral: Referral, existingAppointment: Appointment?, appointmentTime: OffsetDateTime, durationInMinutes: Int, appointmentType: AppointmentType): Long? {
    return existingAppointment?.let {
      if (!isRescheduleBooking(existingAppointment, appointmentTime, durationInMinutes)) {
        // nothing to do !
        return existingAppointment.deliusAppointmentId
      }

      val appointmentRequestDTO = buildAppointmentRescheduleRequestDTO(appointmentTime, durationInMinutes)
      makeBooking(referral.serviceUserCRN, it.deliusAppointmentId!!, appointmentRequestDTO, communityApiRescheduleAppointmentLocation)
    } ?: run {
      val appointmentRequestDTO = buildAppointmentCreateRequestDTO(referral, appointmentTime, durationInMinutes, appointmentType)
      makeBooking(referral.serviceUserCRN, referral.relevantSentenceId!!, appointmentRequestDTO, communityApiBookAppointmentLocation)
    }
  }

  private fun makeBooking(serviceCrn: String, contextId: Long, appointmentRequestDTO: AppointmentRequestDTO, communityApiUrl: String): Long {
    val communityApiBookAppointmentPath = UriComponentsBuilder.fromPath(communityApiUrl)
      .buildAndExpand(serviceCrn, contextId, integrationContext)
      .toString()

    val response = communityAPIClient.makeSyncPostRequest(communityApiBookAppointmentPath, appointmentRequestDTO, AppointmentResponseDTO::class.java)
    logger.debug("Requested booking for appointment. Returned appointment id: $response")

    return response.appointmentId
  }

  private fun buildAppointmentCreateRequestDTO(referral: Referral, appointmentTime: OffsetDateTime, durationInMinutes: Int, appointmentType: AppointmentType): AppointmentCreateRequestDTO {
    val resourceUrl = buildReferralResourceUrl(referral, appointmentType)

    return AppointmentCreateRequestDTO(
      contractType = referral.intervention.dynamicFrameworkContract.contractType.code,
      referralStart = referral.sentAt!!,
      referralId = referral.id,
      appointmentStart = appointmentTime,
      appointmentEnd = appointmentTime.plusMinutes(durationInMinutes.toLong()),
      officeLocationCode = officeLocation,
      notes = getNotes(referral, resourceUrl, "${get(appointmentType, notesFieldQualifier)} Appointment"),
      countsTowardsRarDays = get(appointmentType, countsTowardsRarDays),
    )
  }

  private fun buildAppointmentRescheduleRequestDTO(appointmentTime: OffsetDateTime, durationInMinutes: Int): AppointmentRescheduleRequestDTO {
    return AppointmentRescheduleRequestDTO(
      updatedAppointmentStart = appointmentTime,
      updatedAppointmentEnd = appointmentTime.plusMinutes(durationInMinutes.toLong()),
      initiatedByServiceProvider = true, // fixme - needs to come from the user - defaulted to SP Initiated Reschedule
    )
  }

  private fun buildReferralResourceUrl(referral: Referral, appointmentType: AppointmentType): String {
    return UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(get(appointmentType, interventionsUIViewAppointmentLinks))
      .buildAndExpand(referral.id)
      .toString()
  }

  fun isRescheduleBooking(existingAppointment: Appointment, appointmentTime: OffsetDateTime, durationInMinutes: Int): Boolean =
    isDifferentTimings(existingAppointment, appointmentTime, durationInMinutes)

  fun isDifferentTimings(existingAppointment: Appointment, appointmentTime: OffsetDateTime, durationInMinutes: Int): Boolean =
    !existingAppointment.appointmentTime.isEqual(appointmentTime) || existingAppointment.durationInMinutes != durationInMinutes

  private inline fun <reified T> get(appointmentType: AppointmentType, map: Map<AppointmentType, T>): T {
    return map[appointmentType] ?: throw IllegalStateException("Property value not found for $appointmentType")
  }
}

abstract class AppointmentRequestDTO

data class AppointmentCreateRequestDTO(
  val contractType: String,
  val referralStart: OffsetDateTime,
  val referralId: UUID,
  val appointmentStart: OffsetDateTime,
  val appointmentEnd: OffsetDateTime,
  val officeLocationCode: String,
  val notes: String,
  val countsTowardsRarDays: Boolean,
) : AppointmentRequestDTO()

data class AppointmentRescheduleRequestDTO(
  val updatedAppointmentStart: OffsetDateTime?,
  val updatedAppointmentEnd: OffsetDateTime?,
  val initiatedByServiceProvider: Boolean,
) : AppointmentRequestDTO()

data class AppointmentResponseDTO(
  @NotNull val appointmentId: Long
)
