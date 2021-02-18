package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Flux
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

val AuthServiceProviderGroupPrefix = "INT_SP_"

data class AuthGroup(
  val groupCode: String,
  val groupName: String,
)

@Service
class HMPPSAuthService(
  @Value("\${hmppsauth.api.locations.user-groups}") private val userGroupsLocation: String,
  private val hmppsAuthApiWebClient: WebClient,
) {
  fun getServiceProviderOrganizationForUser(user: AuthUser): AuthGroupID? {
    val url = UriComponentsBuilder.fromPath(userGroupsLocation)
      .buildAndExpand(user.userName)
      .toString()

    val groups = hmppsAuthApiWebClient.get().uri(url)
      .retrieve()
      .bodyToFlux(AuthGroup::class.java)
      .onErrorResume { e ->
        when (e) {
          is WebClientResponseException -> {
            // we expect 404s for non-auth users
            if (!e.statusCode.equals(HttpStatus.NOT_FOUND)) {
              log.error("could not get groups for user", e)
            }
          }
          else -> log.error("could not get groups for user", e)
        }
        Flux.empty()
      }
      .collectList().block()

    val serviceProviderOrgs = groups
      .filter { it.groupCode.startsWith(AuthServiceProviderGroupPrefix) }
      .map { it.groupCode.removePrefix(AuthServiceProviderGroupPrefix) }

    // in the future, we will have to handle multiple group memberships
    // which represent SP admins managing subcontractor organizations.
    // for now we can assume there is only one group per user.
    return if (serviceProviderOrgs.isEmpty()) null else serviceProviderOrgs[0]
  }

  companion object {
    private val log = LoggerFactory.getLogger(HMPPSAuthService::class.java)
  }
}
