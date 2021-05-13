package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import java.time.OffsetDateTime
import javax.validation.constraints.NotNull

@Service
class CommunityAPIBookingService(
  @Value("\${appointments.bookings.enabled}") private val bookingsEnabled: Boolean,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.view-appointment}") private val interventionsUIViewAppointment: String,
  @Value("\${community-api.locations.book-appointment}") private val communityApiBookAppointmentLocation: String,
  @Value("\${community-api.appointments.office-location}") private val officeLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  val communityAPIClient: CommunityAPIClient,
) {
  companion object : KLogging()

  fun book(existingAppointment: ActionPlanAppointment, appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Long? {
    if (!bookingsEnabled) {
      return null
    }

    when {
      isInitialBooking(existingAppointment, appointmentTime, durationInMinutes) -> {
        return makeInitialBooking(existingAppointment, appointmentTime!!, durationInMinutes!!)
      }
      else -> {}
    }

    return null
  }

  private fun makeInitialBooking(appointment: ActionPlanAppointment, appointmentTime: OffsetDateTime, durationInMinutes: Int): Long {
    val resourceUrl = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(interventionsUIViewAppointment)
      .buildAndExpand(appointment.actionPlan.referral.id)
      .toString()

    val appointmentCreateRequestDTO = AppointmentCreateRequestDTO(
      contractType = "ACC", // Fixme: Using only contract type Accommodation til contract type changes are in
      referralStart = appointment.actionPlan.referral.sentAt!!,
      appointmentStart = appointmentTime,
      appointmentEnd = appointmentTime.plusMinutes(durationInMinutes.toLong()),
      officeLocationCode = officeLocation,
      notes = resourceUrl,
      countsTowardsRarDays = true, // Fixme: For assessment booking this should be false and will pass in when assessment booking is done
    )

    val referral = appointment.actionPlan.referral
    val communityApiBookAppointmentPath = UriComponentsBuilder.fromPath(communityApiBookAppointmentLocation)
      .buildAndExpand(referral.serviceUserCRN, referral.relevantSentenceId!!, integrationContext)
      .toString()

    val response = communityAPIClient.makeSyncPostRequest(communityApiBookAppointmentPath, appointmentCreateRequestDTO, AppointmentCreateResponseDTO::class.java)
    logger.debug("Requested booking for appointment. Returned appointment id: $response")

    return response.appointmentId
  }

  fun isInitialBooking(existingAppointment: ActionPlanAppointment, appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Boolean =
    isTimingSpecified(appointmentTime, durationInMinutes) &&
      !isTimingSpecified(existingAppointment.appointmentTime, existingAppointment.durationInMinutes)

  fun isTimingSpecified(appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Boolean =
    appointmentTime != null && durationInMinutes != null
}

data class AppointmentCreateRequestDTO(
  val contractType: String,
  val referralStart: OffsetDateTime,
  val appointmentStart: OffsetDateTime,
  val appointmentEnd: OffsetDateTime,
  val officeLocationCode: String,
  val notes: String,
  val countsTowardsRarDays: Boolean,
)

data class AppointmentCreateResponseDTO(
  @NotNull val appointmentId: Long
)
