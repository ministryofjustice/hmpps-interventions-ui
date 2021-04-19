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

  fun book(existingAppointment: ActionPlanAppointment, appointmentTime: OffsetDateTime?, durationInMinutes: Int?) {
    if (!bookingsEnabled) {
      return
    }

    when {
      isInitialBooking(existingAppointment, appointmentTime, durationInMinutes) -> {
        makeInitialBooking(existingAppointment, appointmentTime!!, durationInMinutes!!)
      }
      else -> {}
    }
  }

  private fun makeInitialBooking(appointment: ActionPlanAppointment, appointmentTime: OffsetDateTime, durationInMinutes: Int) {
    val resourceUrl = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(interventionsUIViewAppointment)
      .buildAndExpand(appointment.actionPlan.referral.id)
      .toString()

    val appointmentCreateRequestDTO = AppointmentCreateRequestDTO(
      appointmentStart = appointmentTime,
      appointmentEnd = appointmentTime.plusMinutes(durationInMinutes.toLong()),
      officeLocationCode = officeLocation,
      notes = resourceUrl,
      context = integrationContext,
    )

    val referral = appointment.actionPlan.referral
    val communityApiBookAppointmentPath = UriComponentsBuilder.fromPath(communityApiBookAppointmentLocation)
      .buildAndExpand(referral.serviceUserCRN, referral.relevantSentenceId!!)
      .toString()

    val response = communityAPIClient.makeSyncPostRequest(communityApiBookAppointmentPath, appointmentCreateRequestDTO, AppointmentCreateResponseDTO::class.java)
    logger.debug("Requested booking for appointment. Returned appointment id: $response")
  }

  fun isInitialBooking(existingAppointment: ActionPlanAppointment, appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Boolean =
    isTimingSpecified(appointmentTime, durationInMinutes) &&
      !isTimingSpecified(existingAppointment.appointmentTime, existingAppointment.durationInMinutes)

  fun isTimingSpecified(appointmentTime: OffsetDateTime?, durationInMinutes: Int?): Boolean =
    appointmentTime != null && durationInMinutes != null
}

data class AppointmentCreateRequestDTO(
  val appointmentStart: OffsetDateTime,
  val appointmentEnd: OffsetDateTime,
  val officeLocationCode: String,
  val notes: String,
  val context: String,
)

data class AppointmentCreateResponseDTO(
  @NotNull val appointmentId: Long
)
