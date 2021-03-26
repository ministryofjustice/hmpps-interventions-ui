package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.fasterxml.jackson.annotation.JsonFormat
import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import java.time.LocalDate

@Service
class CommunityAPIService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  @Value("\${community-api.locations.sent-referral}") private val communityAPISentReferralLocation: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<ReferralEvent> {
  companion object : KLogging()

  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUISentReferralLocation)
          .buildAndExpand(event.referral.id)
          .toString()

        val referRequest = ReferRequest(
          event.referral.intervention.dynamicFrameworkContract.serviceCategory.name,
          event.referral.relevantSentenceId!!,
          url,
          event.referral.sentAt!!.toLocalDate()
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

data class ReferRequest(
  val serviceCategory: String,
  val sentenceId: Long,
  val notes: String? = null,
  @JsonFormat(pattern = "yyyy-MM-dd")
  val date: LocalDate? = null
)
