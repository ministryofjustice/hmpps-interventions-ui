package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import reactor.core.publisher.Mono
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.util.UUID

data class CreateSupplementaryRiskRequest(
  val source: String,
  val sourceId: UUID,
  val crn: String,
  val createdByUser: String,
  val createdByUserType: String,
  val createdDate: LocalDateTime,
  val riskSummaryComments: String,
)

data class SupplementaryRiskResponse(
  val supplementaryRiskId: UUID,
)

@Service
@Transactional
class RisksAndNeedsService(
  @Value("\${assess-risks-and-needs.locations.create-supplementary-risk}") private val createSupplementaryRiskLocation: String,
  private val assessRisksAndNeedsClient: WebClient,
) {
  companion object : KLogging()

  fun createSupplementaryRisk(referralId: UUID, crn: String, userId: String, riskCreatedAt: OffsetDateTime, riskInformation: String): UUID {
    val request = CreateSupplementaryRiskRequest(
      "INTERVENTION_REFERRAL",
      referralId,
      crn,
      userId,
      "DELIUS",
      riskCreatedAt.toLocalDateTime(),
      riskInformation,
    )

    return assessRisksAndNeedsClient.post().uri(createSupplementaryRiskLocation)
      .bodyValue(request)
      .accept(MediaType.APPLICATION_JSON)
      .acceptCharset(StandardCharsets.UTF_8)
      .retrieve()
      .bodyToMono(SupplementaryRiskResponse::class.java)
      .onErrorResume(WebClientResponseException::class.java) {
        when (it.statusCode) {
          HttpStatus.CONFLICT -> {
            logger.warn(
              "attempted to create new supplementary risk, but risk already exists for this referral {} {}",
              kv("crn", crn),
              kv("referralId", referralId)
            )
          }
        }
        Mono.error(it)
      }
      .block()
      .supplementaryRiskId
  }
}
