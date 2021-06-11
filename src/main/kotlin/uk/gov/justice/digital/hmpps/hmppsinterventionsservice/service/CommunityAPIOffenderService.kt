package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

data class ServiceUserAccessResult(
  val canAccess: Boolean,
  val messages: List<String>,
)

private data class UserAccessResponse(
  val exclusionMessage: String?,
  val restrictionMessage: String?,
)

@Service
class CommunityAPIOffenderService(
  @Value("\${community-api.locations.offender-access}") private val offenderAccessLocation: String,
  private val communityApiRestClient: RestClient,
) {
  fun checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user: AuthUser, crn: String): ServiceUserAccessResult {
    val userAccessPath = UriComponentsBuilder.fromPath(offenderAccessLocation)
      .buildAndExpand(crn, user.userName)
      .toString()

    val response = communityApiRestClient.get(userAccessPath)
      .retrieve()
      .onStatus({ it.equals(HttpStatus.FORBIDDEN) }, { Mono.empty() })
      .toEntity(UserAccessResponse::class.java)
      .block()

    return ServiceUserAccessResult(
      !response.statusCode.equals(HttpStatus.FORBIDDEN),
      listOfNotNull(response.body.restrictionMessage, response.body.exclusionMessage)
    )
  }
}
