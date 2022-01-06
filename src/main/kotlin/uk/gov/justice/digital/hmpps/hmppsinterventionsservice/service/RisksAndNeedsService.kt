package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClientResponseException
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
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

data class CreateFullSupplementaryRiskRequest(
  val source: String,
  val sourceId: UUID,
  val crn: String,
  val createdByUser: String,
  val createdByUserType: String,
  val createdDate: LocalDateTime,
  val riskSummaryComments: String,
  val redactedRisk: RedactedRisk,
)

data class RedactedRisk(
  val riskWho: String,
  val riskWhen: String,
  val riskNature: String,
  val concernsSelfHarm: String,
  val concernsSuicide: String,
  val concernsHostel: String,
  val concernsVulnerability: String,
)

data class SupplementaryRiskResponse(
  val supplementaryRiskId: UUID,
  val createdDate: OffsetDateTime,
)

@Service
@Transactional
class RisksAndNeedsService(
  @Value("\${assess-risks-and-needs.locations.create-supplementary-risk}") private val createSupplementaryRiskLocation: String,
  @Value("\${assess-risks-and-needs.enable-posting-full-risk}") private val canPostFullRiskInformation: Boolean,
  private val assessRisksAndNeedsClient: RestClient,
) {
  companion object : KLogging()

  fun canPostFullRiskInformation(): Boolean {
    return canPostFullRiskInformation
  }

  fun createSupplementaryRisk(referralId: UUID, crn: String, user: AuthUser, riskCreatedAt: OffsetDateTime, riskInformation: String, redactedRisk: RedactedRisk? = null): UUID {

    val request = if (canPostFullRiskInformation && redactedRisk != null) {
      logger.debug("Sending full supplementary risk information to ARN")
      CreateFullSupplementaryRiskRequest(
        "INTERVENTION_REFERRAL",
        referralId,
        crn,
        user.id,
        user.authSource,
        riskCreatedAt.toLocalDateTime(),
        riskInformation,
        redactedRisk
      )
    } else {
      CreateSupplementaryRiskRequest(
        "INTERVENTION_REFERRAL",
        referralId,
        crn,
        user.id,
        user.authSource,
        riskCreatedAt.toLocalDateTime(),
        riskInformation,
      )
    }

    // this endpoint requires user auth tokens for security reasons
    val authentication = SecurityContextHolder.getContext().authentication as JwtAuthenticationToken
    val response = assessRisksAndNeedsClient.post(createSupplementaryRiskLocation, request, customAuthentication = authentication)
      .retrieve()
      .onStatus({ it == HttpStatus.CONFLICT }, { Mono.empty() })
      .toEntity(SupplementaryRiskResponse::class.java)
      .block()

    if (response.statusCode.equals(HttpStatus.CONFLICT)) {
      if (response.body.createdDate != riskCreatedAt) {
        logger.error(
          "attempted to update an existing supplementary risk with new data {} {} {} {}",
          kv("crn", crn),
          kv("referralId", referralId),
          kv("riskId", response.body.supplementaryRiskId),
          kv("riskCreatedAt", riskCreatedAt)
        )

        throw WebClientResponseException(409, "Conflict from ARN 'createSupplementaryRisk'", null, null, null)
      }
    }

    return response.body.supplementaryRiskId
  }
}
