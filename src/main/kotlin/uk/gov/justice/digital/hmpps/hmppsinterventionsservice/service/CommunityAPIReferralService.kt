package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional
import javax.validation.constraints.NotNull

@Service
@Transactional
class CommunityAPIReferralService(
  @Value("\${community-api.referrals.enabled}") private val referralsEnabled: Boolean,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.probation-links.sent-referral}") private val interventionsUISentReferralLocation: String,
  @Value("\${community-api.locations.sent-referral}") private val communityAPISentReferralLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  val communityAPIClient: CommunityAPIClient,
) : CommunityAPIService {
  companion object : KLogging()

  fun send(referral: Referral) {
    if (!referralsEnabled) {
      return
    }

    val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(interventionsUISentReferralLocation)
      .buildAndExpand(referral.id)
      .toString()

    postReferralStartRequest(referral, url)
  }

  private fun postReferralStartRequest(referral: Referral, url: String) {
    val referRequest = ReferralSentRequest(
      referral.intervention.dynamicFrameworkContract.contractType.code,
      referral.sentAt!!,
      referral.relevantSentenceId!!,
      referral.id,
      getNotes(referral, url, "Referral Sent"),
    )

    val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPISentReferralLocation)
      .buildAndExpand(referral.serviceUserCRN, integrationContext)
      .toString()

    communityAPIClient.makeSyncPostRequest(communityApiSentReferralPath, referRequest, ReferralSentResponseDTO::class.java)
  }
}

data class ReferralSentRequest(
  val contractType: String,
  val startedAt: OffsetDateTime,
  val sentenceId: Long,
  val referralId: UUID,
  val notes: String,
)

data class ReferralSentResponseDTO(
  @NotNull val nsiId: Long
)
