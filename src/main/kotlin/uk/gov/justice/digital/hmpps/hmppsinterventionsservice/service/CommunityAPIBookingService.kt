package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional
import javax.validation.constraints.NotNull

@Service
@Transactional
class CommunityAPIBookingService(
  @Value("\${community-api.appointments.bookings.enabled}") private val bookingsEnabled: Boolean,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.view-appointment}") private val interventionsUIViewAppointment: String,
  @Value("\${community-api.locations.book-appointment}") private val communityApiBookAppointmentLocation: String,
  @Value("\${community-api.locations.reschedule-appointment}") private val communityApiRescheduleAppointmentLocation: String,
  @Value("\${community-api.appointments.office-location}") private val officeLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  val communityAPIClient: CommunityAPIClient,
) : CommunityAPIService {
  companion object : KLogging()

  fun book(existingSession: ActionPlanSession, appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Long? {
    if (!bookingsEnabled) {
      return null
    }

    return processingBooking(existingSession, appointmentTime, durationInMinutes)
  }

  private fun processingBooking(existingSession: ActionPlanSession, appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Long? {

    val referral = existingSession.actionPlan.referral

    when {
      isInitialBooking(existingSession, appointmentTime, durationInMinutes) -> {
        val appointmentRequestDTO = buildAppointmentCreateRequestDTO(existingSession, appointmentTime!!, durationInMinutes!!)
        return makeBooking(referral.serviceUserCRN, referral.relevantSentenceId!!, appointmentRequestDTO, communityApiBookAppointmentLocation)
      }

      isRescheduleBooking(existingSession, appointmentTime, durationInMinutes) -> {
        val appointmentRequestDTO = buildAppointmentRescheduleRequestDTO(appointmentTime!!, durationInMinutes!!)
        return makeBooking(referral.serviceUserCRN, existingSession.deliusAppointmentId!!, appointmentRequestDTO, communityApiRescheduleAppointmentLocation)
      }

      else -> {}
    }

    return null
  }

  private fun makeBooking(serviceCrn: String, contextId: Long, appointmentRequestDTO: AppointmentRequestDTO, communityApiUrl: String): Long {

    val communityApiBookAppointmentPath = UriComponentsBuilder.fromPath(communityApiUrl)
      .buildAndExpand(serviceCrn, contextId, integrationContext)
      .toString()

    val response = communityAPIClient.makeSyncPostRequest(communityApiBookAppointmentPath, appointmentRequestDTO, AppointmentResponseDTO::class.java)
    logger.debug("Requested booking for appointment. Returned appointment id: $response")

    return response.appointmentId
  }

  private fun buildAppointmentCreateRequestDTO(session: ActionPlanSession, appointmentTime: OffsetDateTime, durationInMinutes: Int): AppointmentCreateRequestDTO {
    val resourceUrl = buildReferralResourceUrl(session)

    return AppointmentCreateRequestDTO(
      contractType = session.actionPlan.referral.intervention.dynamicFrameworkContract.contractType.code,
      referralStart = session.actionPlan.referral.sentAt!!,
      referralId = session.actionPlan.referral.id,
      appointmentStart = appointmentTime,
      appointmentEnd = appointmentTime.plusMinutes(durationInMinutes.toLong()),
      officeLocationCode = officeLocation,
      notes = getNotes(session.actionPlan.referral, resourceUrl, "Appointment"),
      countsTowardsRarDays = true, // Fixme: For assessment booking this should be false and will pass in when assessment booking is done
    )
  }

  private fun buildAppointmentRescheduleRequestDTO(appointmentTime: OffsetDateTime, durationInMinutes: Int): AppointmentRescheduleRequestDTO {

    return AppointmentRescheduleRequestDTO(
      updatedAppointmentStart = appointmentTime,
      updatedAppointmentEnd = appointmentTime.plusMinutes(durationInMinutes.toLong()),
      initiatedByServiceProvider = true, // fixme - needs to come from the user - defaulted to SP Initiated Reschedule
    )
  }

  private fun buildReferralResourceUrl(existingSession: ActionPlanSession): String {
    return UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(interventionsUIViewAppointment)
      .buildAndExpand(existingSession.actionPlan.referral.id)
      .toString()
  }

  fun isInitialBooking(existingSession: ActionPlanSession, appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Boolean =
    isTimingSpecified(appointmentTime, durationInMinutes) &&
      !isTimingSpecified(existingSession.appointmentTime, existingSession.durationInMinutes)

  fun isRescheduleBooking(existingSession: ActionPlanSession, appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Boolean =
    isTimingSpecified(appointmentTime, durationInMinutes) &&
      isTimingSpecified(existingSession.appointmentTime, existingSession.durationInMinutes) &&
      isDifferentTimings(existingSession, appointmentTime!!, durationInMinutes!!)

  fun isTimingSpecified(appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Boolean =
    appointmentTime != null && durationInMinutes != null

  fun isDifferentTimings(existingSession: ActionPlanSession, appointmentTime: OffsetDateTime, durationInMinutes: Int): Boolean =
    !existingSession.appointmentTime!!.isEqual(appointmentTime) || existingSession.durationInMinutes != durationInMinutes
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
