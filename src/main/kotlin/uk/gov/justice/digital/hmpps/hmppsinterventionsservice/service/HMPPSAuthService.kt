package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.util.UriComponentsBuilder
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
    if (user.authSource != "auth") {
      return null
    }

    val url = UriComponentsBuilder.fromPath(userGroupsLocation)
      .buildAndExpand(user.userName)
      .toString()

    val groups = hmppsAuthApiWebClient.get().uri(url)
      .retrieve()
      .bodyToFlux(AuthGroup::class.java)
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
