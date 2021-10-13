package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component

@Component
class ClientApiAccessChecker {
  private val roleForApiRead = "ROLE_INTERVENTIONS_API_READ_ALL"

  fun isClientRequestWithReadAllRole(authentication: JwtAuthenticationToken): Boolean {
    val isClientOnly = authentication.token.subject == authentication.token.getClaimAsString("client_id")
    val hasReadAllRole = authentication.authorities.any { it.authority == roleForApiRead }
    return isClientOnly && hasReadAllRole
  }
}
