package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime

interface CommunityAPIService

@Service
class CommunityAPIReferralEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  @Value("\${interventions-ui.locations.cancelled-referral}") private val interventionsUICancelledReferralLocation: String,
  @Value("\${interventions-ui.locations.submit-end-of-service-report}") private val interventionsUIEndOfServiceReportLocation: String,
  @Value("\${community-api.locations.sent-referral}") private val communityAPISentReferralLocation: String,
  @Value("\${community-api.locations.ended-referral}") private val communityAPIEndedReferralLocation: String,
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

        postReferralStartRequest(event, url)
      }
      ReferralEventType.CANCELLED,
      -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUICancelledReferralLocation)
          .buildAndExpand(event.referral.id)
          .toString()

        postReferralEndRequest(event, url)
      }
      ReferralEventType.PREMATURELY_ENDED,
      ReferralEventType.COMPLETED,
      -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUIEndOfServiceReportLocation)
          .buildAndExpand(event.referral.endOfServiceReport!!.id)
          .toString()

        postReferralEndRequest(event, url)
      }
      else -> {}
    }
  }

  private fun postReferralStartRequest(event: ReferralEvent, url: String) {
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

  private fun postReferralEndRequest(event: ReferralEvent, url: String) {
    val referralEndRequest = ReferralEndRequest(
      "ACC", // Fixme: Using only contract type Accommodation til contract type changes are in
      event.referral.sentAt!!,
      event.referral.concludedAt!!,
      event.referral.relevantSentenceId!!,
      event.type.name,
      url,
    )

    val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPIEndedReferralLocation)
      .buildAndExpand(event.referral.serviceUserCRN, integrationContext)
      .toString()

    communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, referralEndRequest)
  }
}

@Service
class CommunityAPIEndOfServiceReportEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.submit-end-of-service-report}") private val interventionsUIEndOfServiceReportLocation: String,
  @Value("\${community-api.locations.notification-request}") private val communityAPINotificationLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<EndOfServiceReportEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: EndOfServiceReportEvent) {
    when (event.type) {
      EndOfServiceReportEventType.SUBMITTED,
      -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUIEndOfServiceReportLocation)
          .buildAndExpand(event.endOfServiceReport.id)
          .toString()

        postNotificationRequest(event, url)
      }
    }
  }

  private fun postNotificationRequest(event: EndOfServiceReportEvent, url: String) {

    val referral = event.endOfServiceReport.referral

    val request = NotificationCreateRequestDTO(
      "ACC", // Fixme: Using only contract type Accommodation til contract type changes are in
      referral.sentAt!!,
      event.endOfServiceReport.submittedAt!!,
      getNotes(referral, url),
    )

    val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPINotificationLocation)
      .buildAndExpand(referral.serviceUserCRN, referral.relevantSentenceId!!, integrationContext)
      .toString()

    communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, request)
  }

  private fun getNotes(referral: Referral, url: String): String {
    val contractTypeDescription = "Accommodation" // Fixme: Using only contract type Accommodation til contract type changes are in
    return "End of Service Report for Referral ${referral.referenceNumber} has been submitted\n" +
      "Prime Provider is ${referral.intervention.dynamicFrameworkContract.primeProvider.name} for Contract Type ${contractTypeDescription}\n" +
      "$url"
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

data class ReferralEndRequest(
  val contractType: String,
  val startedAt: OffsetDateTime,
  val endedAt: OffsetDateTime,
  val sentenceId: Long,
  val endType: String,
  val notes: String,
)

data class NotificationCreateRequestDTO(
  val contractType: String,
  val referralStart: OffsetDateTime,
  val contactDateTime: OffsetDateTime,
  val notes: String
)

data class AppointmentOutcomeRequest(
  val notes: String,
  val attended: String,
  val notifyPPOfAttendanceBehaviour: Boolean,
)
