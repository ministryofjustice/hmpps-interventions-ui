package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.fasterxml.jackson.annotation.JsonFormat
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import java.time.LocalDate

@Service
class CommunityAPIService(
  @Value("\${community-api.contact-notification-context.provider-code}") private val providerCode: String,
  @Value("\${community-api.contact-notification-context.referral-type}") private val referralType: String,
  @Value("\${community-api.contact-notification-context.staff-code}") private val staffCode: String,
  @Value("\${community-api.contact-notification-context.team-code}") private val teamCode: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  @Value("\${community-api.locations.sent-referral}") private val communityAPISentReferralLocation: String,
  private val communityApiWebClient: WebClient,
) : ApplicationListener<ReferralEvent> {

  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUISentReferralLocation)
          .buildAndExpand(event.referral.id)
          .toString()

        val body = ReferRequest(
          providerCode,
          referralType,
          staffCode,
          teamCode,
          url,
          event.referral.sentAt!!.toLocalDate()
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPISentReferralLocation)
          .buildAndExpand(event.referral.serviceUserCRN)
          .toString()

        communityApiWebClient.post().uri(communityApiSentReferralPath)
          .body(Mono.just(body), ReferRequest::class.java)
          .retrieve()
          .bodyToMono(Unit::class.java)
          .onErrorResume { e ->
            log.error("Call to community api to update contact log failed:", e)
            Mono.empty()
          }
          .subscribe()
      }
    }
  }

  companion object {
    private val log = LoggerFactory.getLogger(CommunityAPIService::class.java)
  }
}

data class ReferRequest(
  val providerCode: String? = null,
  val referralType: String? = null,
  val staffCode: String? = null,
  val teamCode: String? = null,
  val notes: String? = null,
  @JsonFormat(pattern = "yyyy-MM-dd")
  val date: LocalDate? = null
)
