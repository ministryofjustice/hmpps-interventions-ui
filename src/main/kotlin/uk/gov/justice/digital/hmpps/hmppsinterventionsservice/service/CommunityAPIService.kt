package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import java.time.OffsetDateTime

interface CommunityAPIService

@Service
class CommunityAPIReferralEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  @Value("\${community-api.locations.sent-referral}") private val communityAPISentReferralLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<ReferralEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUISentReferralLocation)
          .buildAndExpand(event.referral.id)
          .toString()

        val referRequest = ReferRequest(
          "ACC", // Fixme: Using only contract type Accommodation til contract type changes are in
          event.referral.sentAt!!,
          event.referral.relevantSentenceId!!,
          url,
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPISentReferralLocation)
          .buildAndExpand(event.referral.serviceUserCRN, integrationContext)
          .toString()

        communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, referRequest)
      }
      else -> {}
    }
  }
}

@Service
class CommunityAPIAppointmentEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.session-feedback}") private val interventionsUISessionFeedbackLocation: String,
  @Value("\${community-api.locations.appointment-outcome-request}") private val communityAPIAppointmentOutcomeLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<AppointmentEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: AppointmentEvent) {
    when (event.type) {
      SESSION_FEEDBACK_RECORDED -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUISessionFeedbackLocation)
          .buildAndExpand(event.appointment.actionPlan.referral.id, event.appointment.sessionNumber)
          .toString()

        val request = AppointmentOutcomeRequest(
          url,
          event.appointment.attended!!.name,
          event.appointment.notifyPPOfAttendanceBehaviour ?: false
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPIAppointmentOutcomeLocation)
          .buildAndExpand(event.appointment.actionPlan.referral.serviceUserCRN, event.appointment.deliusAppointmentId, integrationContext)
          .toString()

        communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, request)
      }
      else -> {}
    }
  }
}

data class ReferRequest(
  val contractType: String,
  val startedAt: OffsetDateTime,
  val sentenceId: Long,
  val notes: String,
)

data class AppointmentOutcomeRequest(
  val notes: String,
  val attended: String,
  val notifyPPOfAttendanceBehaviour: Boolean,
)
