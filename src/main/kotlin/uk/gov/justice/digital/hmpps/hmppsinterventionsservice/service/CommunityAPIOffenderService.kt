package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

data class Offender(
  val crnNumber: String,
)

data class ServiceUserAccessResult(
  val canAccess: Boolean,
  val messages: List<String>,
)

private data class UserAccessResponse(
  val exclusionMessage: String?,
  val restrictionMessage: String?,
)

private data class StaffDetailsResponse(
  val staffIdentifier: String,
)

@Service
class CommunityAPIOffenderService(
  @Value("\${community-api.locations.offender-access}") private val offenderAccessLocation: String,
  @Value("\${community-api.locations.managed-offenders}") private val managedOffendersLocation: String,
  @Value("\${community-api.locations.staff-details}") private val staffDetailsLocation: String,
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

  fun getManagedOffendersForDeliusUser(user: AuthUser): List<Offender> {
    val staffIdentifier = getStaffIdentifier(user)
      // if a delius user does not have a staff identifier it's not an error;
      // but it does mean they do not have any managed offenders allocated.
      ?: return emptyList()

    val managedOffendersPath = UriComponentsBuilder.fromPath(managedOffendersLocation)
      .buildAndExpand(staffIdentifier)
      .toString()

    return communityApiRestClient.get(managedOffendersPath)
      .retrieve()
      .bodyToFlux(Offender::class.java)
      .collectList()
      .block()
  }

  private fun getStaffIdentifier(user: AuthUser): String? {
    val staffDetailsPath = UriComponentsBuilder.fromPath(staffDetailsLocation)
      .buildAndExpand(user.userName)
      .toString()

    return communityApiRestClient.get(staffDetailsPath)
      .retrieve()
      .bodyToMono(StaffDetailsResponse::class.java)
      .onErrorResume(WebClientResponseException::class.java) { e ->
        when (e.statusCode) {
          // not all delius users are staff
          HttpStatus.NOT_FOUND -> Mono.empty()
          else -> Mono.error(e)
        }
      }
      .block()
      ?.staffIdentifier
  }
}
