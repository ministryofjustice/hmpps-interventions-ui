package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.fasterxml.jackson.databind.node.BooleanNode.valueOf
import com.fasterxml.jackson.databind.node.TextNode.valueOf
import com.github.fge.jackson.jsonpointer.JsonPointer.of
import com.github.fge.jsonpatch.JsonPatch
import com.github.fge.jsonpatch.ReplaceOperation
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
import java.util.UUID

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
          event.referral.sentAt!!,
          event.referral.intervention.dynamicFrameworkContract.serviceCategory.id,
          event.referral.relevantSentenceId!!,
          url,
          integrationContext
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPISentReferralLocation)
          .buildAndExpand(event.referral.serviceUserCRN)
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
  @Value("\${community-api.locations.patch-appointment}") private val communityAPIPatchAppointmentLocation: String,
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

        val jsonPatch = JsonPatch(
          listOf(
            ReplaceOperation(of("notes"), valueOf(url)),
            ReplaceOperation(of("attended"), valueOf(event.appointment.attended!!.name)),
            ReplaceOperation(of("notifyPPOfAttendanceBehaviour"), valueOf(event.appointment.notifyPPOfAttendanceBehaviour ?: false))
          )
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPIPatchAppointmentLocation)
          .buildAndExpand(event.appointment.actionPlan.referral.serviceUserCRN, event.appointment.deliusAppointmentId, integrationContext)
          .toString()

        communityAPIClient.makeAsyncPatchRequest(communityApiSentReferralPath, jsonPatch)
      }
      else -> {}
    }
  }
}

data class ReferRequest(
  val sentAt: OffsetDateTime,
  val serviceCategoryId: UUID,
  val sentenceId: Long,
  val notes: String,
  val context: String,
)
